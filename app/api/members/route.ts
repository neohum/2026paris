import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  try {
    const formData = await request.formData();
    
    // Parse fields
    const passportLastName = formData.get('passportLastName');
    const passportFirstName = formData.get('passportFirstName');
    const passportNumber = formData.get('passportNumber');
    const passportExpiry = formData.get('passportExpiry');
    const birthDate = formData.get('birthDate');
    const emergencyContact = formData.get('emergencyContact');
    const notes = formData.get('notes');
    
    // Parse File
    const file = formData.get('passportPhoto') as File | null;
    let photoPath = null;
    
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${user.id}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const uploadDir = join(process.cwd(), 'public/uploads');
      if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
      }
      photoPath = `/uploads/${filename}`;
      await writeFile(join(uploadDir, filename), buffer);
    }

    // Insert or update member_info
    const existingRes = await query('SELECT id FROM member_info WHERE user_id = $1', [user.id]);
    
    if (existingRes.rows.length > 0) {
      // Update
      const updateQuery = photoPath 
        ? `UPDATE member_info SET passport_last_name = $1, passport_first_name = $2, passport_number = $3, passport_expiry = $4, birth_date = $5, emergency_contact = $6, notes = $7, updated_at = NOW(), photo_path = $8 WHERE user_id = $9`
        : `UPDATE member_info SET passport_last_name = $1, passport_first_name = $2, passport_number = $3, passport_expiry = $4, birth_date = $5, emergency_contact = $6, notes = $7, updated_at = NOW() WHERE user_id = $8`;
        
      const values = photoPath 
        ? [passportLastName, passportFirstName, passportNumber, passportExpiry, birthDate, emergencyContact, notes, photoPath, user.id]
        : [passportLastName, passportFirstName, passportNumber, passportExpiry, birthDate, emergencyContact, notes, user.id];
        
      await query(updateQuery, values);
    } else {
      // Insert
      await query(`
        INSERT INTO member_info (
          user_id, passport_last_name, passport_first_name, passport_number, 
          passport_expiry, birth_date, emergency_contact, notes, photo_path
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [user.id, passportLastName, passportFirstName, passportNumber, passportExpiry, birthDate, emergencyContact, notes, photoPath]);
    }

    return NextResponse.json({ message: '저장 완료' });
  } catch (err) {
    console.error('Member info save error:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  try {
    const res = await query('SELECT * FROM member_info WHERE user_id = $1', [user.id]);
    return NextResponse.json(res.rows[0] || null);
  } catch (err) {
    return NextResponse.json({ error: '데이터 로드 실패' }, { status: 500 });
  }
}
