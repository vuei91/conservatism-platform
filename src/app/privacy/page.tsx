import { Card, CardContent } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        개인정보처리방침
      </h1>

      <Card>
        <CardContent className="prose prose-gray max-w-none p-8">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              1. 개인정보의 수집 및 이용 목적
            </h2>
            <p className="text-gray-600 leading-relaxed">
              보수학당(이하 &quot;플랫폼&quot;)은 다음의 목적을 위하여
              개인정보를 처리합니다:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>
                회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 회원자격
                유지·관리
              </li>
              <li>
                서비스 제공: 학습 진도 관리, 노트 저장, 즐겨찾기 등 맞춤형
                서비스 제공
              </li>
              <li>서비스 개선: 서비스 이용 통계 분석 및 서비스 개선</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              2. 수집하는 개인정보 항목
            </h2>
            <p className="text-gray-600 leading-relaxed">
              플랫폼은 다음의 개인정보 항목을 수집합니다:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>필수항목: 이메일 주소, 비밀번호, 이름(닉네임)</li>
              <li>
                자동수집항목: 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              3. 개인정보의 보유 및 이용 기간
            </h2>
            <p className="text-gray-600 leading-relaxed">
              플랫폼은 회원 탈퇴 시까지 개인정보를 보유합니다. 단, 관계 법령에
              따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
              <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
              <li>웹사이트 방문기록: 3개월</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              1년 이상 서비스를 이용하지 않은 회원의 개인정보는 별도로 분리하여
              보관하거나 파기합니다. 분리 보관된 개인정보는 법령에 따른 보관
              의무가 있는 경우를 제외하고 해당 회원의 요청 시 즉시 파기합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              4. 쿠키의 설치·운영 및 거부
            </h2>
            <p className="text-gray-600 leading-relaxed">
              플랫폼은 이용자에게 개별적인 맞춤 서비스를 제공하기 위해
              쿠키(Cookie)를 사용합니다.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              쿠키는 웹사이트를 운영하는 데 이용되는 서버가 이용자의 브라우저에
              보내는 소량의 정보이며, 이용자의 컴퓨터에 저장됩니다.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              쿠키 사용 목적:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>로그인 상태 유지</li>
              <li>이용자의 접속 빈도나 방문 시간 등 분석</li>
              <li>이용자의 서비스 이용 패턴 파악을 통한 서비스 개선</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 웹 브라우저
              설정을 통해 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을
              거치거나, 모든 쿠키의 저장을 거부할 수 있습니다. 단, 쿠키 저장을
              거부할 경우 로그인이 필요한 일부 서비스 이용에 어려움이 있을 수
              있습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              5. 개인정보의 제3자 제공
            </h2>
            <p className="text-gray-600 leading-relaxed">
              플랫폼은 원칙적으로 이용자의 개인정보를 제3자에게 제공하지
              않습니다. 다만, 다음의 경우에는 예외로 합니다:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>이용자가 사전에 동의한 경우</li>
              <li>
                법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와
                방법에 따라 수사기관의 요구가 있는 경우
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              6. 개인정보의 파기
            </h2>
            <p className="text-gray-600 leading-relaxed">
              플랫폼은 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
              불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              7. 이용자의 권리
            </h2>
            <p className="text-gray-600 leading-relaxed">
              이용자는 다음과 같은 권리를 행사할 수 있습니다:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              8. 개인정보 보호책임자
            </h2>
            <p className="text-gray-600 leading-relaxed">
              플랫폼은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
              처리와 관련한 이용자의 불만처리 및 피해구제 등을 위하여 아래와
              같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-gray-700 font-medium">개인정보 보호책임자</p>
              <p className="text-gray-600 mt-1">이메일: wkwk2805u@naver.com</p>
            </div>
            <p className="text-gray-600 mt-4">
              개인정보 관련 문의사항은 위 이메일 또는 플랫폼 내 문의하기 기능을
              이용해 주시기 바랍니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              9. 개인정보처리방침의 변경
            </h2>
            <p className="text-gray-600 leading-relaxed">
              이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른
              변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일
              전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <p className="mt-8 text-sm text-gray-500">시행일: 2026년 2월 11일</p>
        </CardContent>
      </Card>
    </div>
  );
}
