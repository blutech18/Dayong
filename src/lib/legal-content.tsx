// Shared legal copy for DAYONG. Used by the standalone /terms and /privacy
// pages and by the signup consent modal so the wording stays in sync.

export const LEGAL_EFFECTIVE_DATE = "July 1, 2026";

type Section = { heading: string; body: string[] };

function Document({ intro, sections }: { intro: string; sections: Section[] }) {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
      <p>{intro}</p>
      {sections.map((section, i) => (
        <section key={section.heading} className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            {i + 1}. {section.heading}
          </h2>
          {section.body.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
        </section>
      ))}
    </div>
  );
}

export function TermsContent() {
  return (
    <Document
      intro="These Terms of Service govern your access to and use of the DAYONG Member Assistance & Collection Management platform. By creating an account you agree to be bound by these terms."
      sections={[
        {
          heading: "Acceptance of Terms",
          body: [
            "By registering for or using DAYONG, you confirm that you are authorized to act on behalf of your community organization and that you accept these terms in full.",
            "If you do not agree with any part of these terms, you must not create an account or use the platform.",
          ],
        },
        {
          heading: "Use of the Platform",
          body: [
            "DAYONG is provided to help mutual-aid organizations manage member records, contributions, collection events, assistance requests, and financial reporting.",
            "You agree to use the platform only for lawful purposes and in accordance with the internal policies of your organization.",
          ],
        },
        {
          heading: "Account Responsibilities",
          body: [
            "You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.",
            "You must notify an administrator immediately of any unauthorized access or suspected security breach.",
          ],
        },
        {
          heading: "Member and Financial Data",
          body: [
            "You are responsible for the accuracy of the member and financial information you enter. Contribution ledgers and assistance records should reflect real transactions approved by your organization.",
            "DAYONG maintains audit logs to support transparency and accountability across staff roles.",
          ],
        },
        {
          heading: "Acceptable Conduct",
          body: [
            "You agree not to misuse the platform, attempt to gain unauthorized access, interfere with its operation, or use it to store unlawful or fraudulent records.",
          ],
        },
        {
          heading: "Service Availability",
          body: [
            "We aim to keep DAYONG available and reliable, but the service may be interrupted for maintenance, updates, or circumstances beyond our control. Scheduled maintenance will be communicated where possible.",
          ],
        },
        {
          heading: "Limitation of Liability",
          body: [
            'DAYONG is provided on an "as is" and "as available" basis. To the fullest extent permitted by law, we are not liable for indirect or consequential losses arising from your use of the platform.',
          ],
        },
        {
          heading: "Changes to These Terms",
          body: [
            "We may update these terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised terms.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "For questions about these terms, contact your organization administrator or email hello@dayong.org.",
          ],
        },
      ]}
    />
  );
}

export function PrivacyContent() {
  return (
    <Document
      intro="This Privacy Policy explains how DAYONG collects, uses, and protects information when your organization uses the Member Assistance & Collection Management platform."
      sections={[
        {
          heading: "Information We Collect",
          body: [
            "We collect account information (such as name and email), member records, contribution and payment details, assistance requests, and activity logs that you or your organization provide or generate through normal use.",
          ],
        },
        {
          heading: "How We Use Information",
          body: [
            "Information is used to operate the platform: managing members, recording contributions, processing assistance requests, generating reports, and maintaining audit trails.",
            "We do not sell personal information to third parties.",
          ],
        },
        {
          heading: "Data Storage and Security",
          body: [
            "Data is stored securely and access is restricted based on staff roles and permissions. We apply reasonable technical and organizational measures to protect against unauthorized access, loss, or disclosure.",
          ],
        },
        {
          heading: "Access Controls",
          body: [
            "Different staff roles (such as administrator, treasurer, collector, and viewer) have different levels of access. Your organization is responsible for assigning roles appropriately.",
          ],
        },
        {
          heading: "Data Retention",
          body: [
            "Records are retained for as long as they are needed to support your organization's operations, financial reporting, and legal obligations.",
          ],
        },
        {
          heading: "Your Rights",
          body: [
            "Members may request access to or correction of their personal information through your organization. Requests are handled in line with applicable data protection requirements.",
          ],
        },
        {
          heading: "Cookies and Sessions",
          body: [
            "We use essential cookies and session data to keep you signed in and to remember preferences such as your theme. These are required for the platform to function.",
          ],
        },
        {
          heading: "Changes to This Policy",
          body: [
            "We may revise this policy periodically. Material changes will be communicated, and continued use of the platform indicates acceptance of the updated policy.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "For privacy questions or data requests, contact your organization administrator or email hello@dayong.org.",
          ],
        },
      ]}
    />
  );
}
