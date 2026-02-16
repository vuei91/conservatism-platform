import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-xl font-bold text-blue-600">
              보수주의 강의
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              보수주의 사상과 철학을 배우고자 하는 분들을 위한 무료 교육
              플랫폼입니다. 유튜브에 산재된 양질의 강의를 체계적으로 정리하여
              제공합니다.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">바로가기</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/lectures"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  강의 목록
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">정보</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  문의하기
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} 보수주의 강의 플랫폼. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
