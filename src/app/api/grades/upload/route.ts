import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Strict CSRF Protection for API Route
    const origin = request.headers.get('origin');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    if (!origin || origin !== appUrl) {
      return NextResponse.json({ error: 'CSRF rejected' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    
    // Parse CSV
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      return NextResponse.json({ error: 'Failed to parse CSV', details: result.errors }, { status: 400 });
    }

    const data = result.data as Record<string, string>[];
    
    let processedCount = 0;
    
    // Begin transaction for bulk upsert
    await prisma.$transaction(async (tx) => {
      for (const row of data) {
        const email = row['Email'] || row['email'];
        if (!email) continue;
        
        const name = row['Name'] || row['name'] || null;
        
        const assessments: Record<string, { score: number, max: number, absMax: number, absScore: number }> = {};
        let totalAbsScore = 0;
        let totalAbsMax = 0;
        
        // Find all base assessment names (keys that aren't Email or Name)
        const allKeys = Object.keys(row);
        const assessmentKeys = allKeys.filter(k => {
          const lower = k.toLowerCase().trim();
          if (lower === 'email' || lower === 'name') return false;
          return true;
        });

        for (const fullKey of assessmentKeys) {
          const scoreStr = row[fullKey];
          if (!scoreStr || scoreStr.trim() === '') continue;
          
          const score = parseFloat(scoreStr);
          if (isNaN(score)) continue;

          // Try to extract Max and Abs from the header: "Quiz 1 [Max:20, Abs:2]"
          // Allows optional spaces around numbers and punctuation
          const match = fullKey.match(/(.+?)\s*\[\s*Max:\s*(\d+(?:\.\d+)?)\s*,\s*Abs:\s*(\d+(?:\.\d+)?)\s*\]/i);
          
          let baseKey = fullKey.trim();
          let max = 100;
          let absMax = 0;

          if (match) {
            baseKey = match[1].trim();
            max = parseFloat(match[2]);
            absMax = parseFloat(match[3]);
          }

          // Calculate absolute earned score
          const absScore = max > 0 ? (score / max) * absMax : 0;

          assessments[baseKey] = {
            score,
            max,
            absMax,
            absScore: parseFloat(absScore.toFixed(2)) // Round to 2 decimals for clean storage
          };

          totalAbsScore += absScore;
          totalAbsMax += absMax;
        }
        
        await tx.gradeRecord.upsert({
          where: { studentEmail: email },
          update: {
            studentName: name,
            assessments,
            totalAbsScore,
            totalAbsMax,
            uploadedAt: new Date(),
          },
          create: {
            studentEmail: email,
            studentName: name,
            assessments,
            totalAbsScore,
            totalAbsMax,
          },
        });
        
        processedCount++;
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed ${processedCount} records` 
    });
    
  } catch (error: unknown) {
    console.error('CSV Upload Error:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV file' },
      { status: 500 }
    );
  }
}
