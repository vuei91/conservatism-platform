-- profiles 테이블에 email_verified 컬럼 추가
ALTER TABLE profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
