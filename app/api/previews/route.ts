import { NextRequest, NextResponse } from 'next/server';
import { db, previews } from '@/db';
import { eq, desc } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // upsert preview by build_id
  await db
    .insert(previews)
    .values({
      build_id: body.build_id,
      repo: body.repo,
      pr_number: body.pr_number,
      commit_sha: body.commit_sha,
      branch: body.branch,
      actor: body.actor,
      frontend_url: body.frontend_url,
      status: body.status || 'ready',
    })
    .onConflictDoUpdate({
      target: previews.build_id,
      set: {
        frontend_url: body.frontend_url,
        status: body.status || 'ready',
        updated_at: new Date(),
      },
    });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  if (!body.build_id || !body.status) {
    return NextResponse.json(
      { ok: false, error: 'Missing build_id or status' },
      { status: 400 }
    );
  }

  await db
    .update(previews)
    .set({ status: body.status })
    .where(eq(previews.build_id, body.build_id));

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const allPreviews = await db
    .select()
    .from(previews)
    .orderBy(desc(previews.created_at));
  return NextResponse.json(allPreviews);
}
