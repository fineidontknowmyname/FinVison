// File: app/api/personalized/route.ts
import { NextResponse } from 'next/server';

// URL of your FastAPI backend
const PYTHON_SERVICE_URL = 'http://127.0.0.1:8000';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();

    // Forward the request to the FastAPI endpoint
    const response = await fetch(`${PYTHON_SERVICE_URL}/personalized_recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Python service responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in /api/personalized:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
