import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { user_json, job_description } = await request.json();

    // Call the Python Flask API
    const response = await fetch('http://localhost:5000/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_json,
        job_description
      })
    });

    if (!response.ok) {
      throw new Error(`Python API responded with status: ${response.status}`);
    }

    const enhancedData = await response.json();
    return NextResponse.json(enhancedData);
  } catch (error) {
    console.error('Error enhancing resume:', error);
    return NextResponse.json(
      { message: 'Error processing resume data' },
      { status: 500 }
    );
  }
}