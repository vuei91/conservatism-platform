import { Card, CardContent } from "@/components/ui";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">이용약관</h1>

      <Card>
        <CardContent className="prose prose-gray max-w-none p-8">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              제1조 (목적)
            </h2>
            <p className="text-gray-600 leading-relaxed">
              본 약관은 보수학당(이하 &quot;플랫폼&quot;)이 제공하는 서비스의
              이용조건 및 절차, 플랫폼과 회원 간의 권리, 의무 및 책임사항을
              규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              제2조 (서비스의 내용)
            </h2>
            <p className="text-gray-600 leading-relaxed">
              플랫폼은 다음과 같은 서비스를 제공합니다:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>유튜브 강의 영상 큐레이션 및 제공</li>
              <li>커리큘럼 기반 학습 경로 제공</li>
              <li>학습 노트 작성 및 관리 기능</li>
              <li>학습 진도 관리 기능</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              플랫폼에서 제공하는 강의 영상은 유튜브 임베드 방식으로 제공되며,
              원저작자의 사정(영상 삭제, 비공개 전환, 지역 제한 등)에 따라 사전
              고지 없이 영상 제공이 중단될 수 있습니다. 이 경우 플랫폼은 이에
              대한 책임을 지지 않습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              제3조 (회원가입)
            </h2>
            <p className="text-gray-600 leading-relaxed">
              회원가입은 이용자가 본 약관에 동의하고, 플랫폼이 정한 가입 양식에
              따라 회원정보를 기입한 후 가입신청을 하면 플랫폼이 이를
              승낙함으로써 체결됩니다.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              플랫폼은 다음 각 호에 해당하는 경우 회원가입을 거절하거나 사후에
              회원자격을 제한 또는 상실시킬 수 있습니다:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>가입 신청 시 허위 정보를 기재한 경우</li>
              <li>과거에 본 약관 위반으로 회원자격을 상실한 적이 있는 경우</li>
              <li>타인의 명의를 도용하여 가입 신청한 경우</li>
              <li>기타 플랫폼이 정한 이용 신청 요건을 충족하지 못한 경우</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              제4조 (회원의 의무)
            </h2>
            <p className="text-gray-600 leading-relaxed">
              회원은 다음 행위를 하여서는 안 됩니다:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>타인의 정보 도용</li>
              <li>플랫폼에 게시된 정보의 무단 변경</li>
              <li>플랫폼이 금지한 정보의 송신 또는 게시</li>
              <li>플랫폼 및 제3자의 저작권 등 지적재산권 침해</li>
              <li>
                플랫폼 및 제3자의 명예를 손상시키거나 업무를 방해하는 행위
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              제5조 (저작권)
            </h2>
            <p className="text-gray-600 leading-relaxed">
              플랫폼에서 제공하는 강의 영상의 저작권은 해당 영상의 원저작자에게
              있습니다. 플랫폼은 유튜브 영상을 임베드 방식으로 제공하며, 영상의
              저작권을 주장하지 않습니다.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              플랫폼은 유튜브 서비스 약관 및 API 정책을 준수하며, 유튜브 정책
              변경에 따라 서비스 제공 방식이 변경될 수 있습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              제6조 (면책조항)
            </h2>
            <p className="text-gray-600 leading-relaxed">
              플랫폼은 다음 각 호의 경우 서비스 제공에 대한 책임이 면제됩니다:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 space-y-1">
              <li>
                천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인
                사유로 서비스를 제공할 수 없는 경우
              </li>
              <li>
                서버 점검, 시스템 업데이트, 보안 패치 등 운영상의 사유로
                서비스가 일시 중단되는 경우
              </li>
              <li>회원의 귀책사유로 인한 서비스 이용 장애</li>
              <li>
                원저작자의 사정으로 유튜브 영상이 삭제되거나 비공개로 전환되어
                영상을 제공할 수 없는 경우
              </li>
              <li>
                유튜브 서비스의 장애 또는 정책 변경으로 인해 영상 제공이
                불가능한 경우
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              본 플랫폼은 무료로 제공되는 서비스이며, 플랫폼은 서비스의 지속적인
              제공을 보장하지 않습니다. 운영 상황에 따라 사전 고지 후 서비스가
              종료될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              제7조 (약관의 변경)
            </h2>
            <p className="text-gray-600 leading-relaxed">
              플랫폼은 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 플랫폼
              내 공지사항을 통해 공지합니다. 회원은 변경된 약관에 동의하지 않을
              경우 회원 탈퇴를 요청할 수 있습니다.
            </p>
          </section>

          <p className="mt-8 text-sm text-gray-500">시행일: 2026년 2월 11일</p>
        </CardContent>
      </Card>
    </div>
  );
}
