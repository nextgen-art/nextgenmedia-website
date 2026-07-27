import Header from "@/components/Header";
import Footer from "@/components/Footer";

const EFFECTIVE_DATE = "July 27, 2026";
const LAST_UPDATED = "July 27, 2026";

const Section = ({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <h2 className="text-xl font-semibold text-foreground">
      {number}. {title}
    </h2>
    <div className="mt-3 space-y-3 text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

const List = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-1.5 pl-6">
    {items.map((i) => (
      <li key={i}>{i}</li>
    ))}
  </ul>
);

const PrivacyPolicy = () => {
  return (
    <div className="landing-theme min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="container mx-auto px-6 pb-8 pt-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Privacy Policy</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Effective Date: {EFFECTIVE_DATE} &nbsp;|&nbsp; Last Updated: {LAST_UPDATED}
          </p>
        </section>

        <section className="container mx-auto px-6 pb-24">
          <div className="max-w-3xl space-y-8">
            <Section number="1" title="Introduction">
              <p>
                Welcome to NextGen Media (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;).
              </p>
              <p>
                We respect your privacy and are committed to protecting your personal
                information. This Privacy Policy explains how we collect, use, disclose, store,
                and protect your information when you:
              </p>
              <List
                items={[
                  "Visit our website;",
                  "Use our mobile applications;",
                  "Purchase our products or services;",
                  "Contact us;",
                  "Interact with us through social media;",
                  "Subscribe to newsletters or marketing communications; and",
                  "Otherwise engage with our business.",
                ]}
              />
              <p>
                By using our services, you acknowledge that you have read and understood this
                Privacy Policy.
              </p>
            </Section>

            <Section number="2" title="Information We Collect">
              <p>We may collect several categories of information.</p>

              <p className="text-foreground font-medium">A. Personal Information</p>
              <p>Information you voluntarily provide may include:</p>
              <List
                items={[
                  "Full name",
                  "Email address",
                  "Phone number",
                  "Mailing address",
                  "Billing address",
                  "Shipping address",
                  "Username",
                  "Password",
                  "Date of birth (where applicable)",
                  "Government-issued identification (if legally required)",
                  "Profile photographs",
                  "Business information",
                  "Customer support communications",
                ]}
              />

              <p className="text-foreground font-medium">B. Payment Information</p>
              <p>
                If you purchase products or services, payment information may be collected by our
                payment processor, including:
              </p>
              <List items={["Credit/debit card details", "Bank account information", "Billing address"]} />
              <p>We do not store full payment card numbers unless expressly stated.</p>

              <p className="text-foreground font-medium">C. Automatically Collected Information</p>
              <p>When you visit our website or use our services, we may automatically collect:</p>
              <List
                items={[
                  "IP address",
                  "Browser type",
                  "Device identifiers",
                  "Operating system",
                  "Language preferences",
                  "Referring URLs",
                  "Pages visited",
                  "Time spent on pages",
                  "Clickstream data",
                  "App usage statistics",
                  "Crash reports",
                  "Network information",
                  "Approximate geographic location",
                ]}
              />

              <p className="text-foreground font-medium">D. Cookies and Tracking Technologies</p>
              <p>We may use:</p>
              <List
                items={[
                  "Cookies",
                  "Pixels",
                  "Local storage",
                  "Session cookies",
                  "Persistent cookies",
                  "Web beacons",
                  "Analytics technologies",
                ]}
              />
              <p>These technologies help us:</p>
              <List
                items={[
                  "Remember preferences",
                  "Improve functionality",
                  "Analyze traffic",
                  "Personalize content",
                  "Measure advertising effectiveness",
                  "Prevent fraud",
                ]}
              />
              <p>
                Users may disable cookies through browser settings, although some features may
                not function properly.
              </p>
            </Section>

            <Section number="3" title="How We Use Your Information">
              <p>We may use your information to:</p>
              <List
                items={[
                  "Provide our services",
                  "Process transactions",
                  "Fulfill orders",
                  "Verify identity",
                  "Create user accounts",
                  "Respond to customer inquiries",
                  "Improve our products",
                  "Analyze website usage",
                  "Maintain security",
                  "Detect fraud",
                  "Comply with legal obligations",
                  "Send service announcements",
                  "Deliver marketing communications",
                  "Personalize user experiences",
                  "Conduct internal research",
                  "Develop new features",
                  "Monitor system performance",
                ]}
              />
            </Section>

            <Section number="4" title="Legal Bases for Processing (GDPR)">
              <p>
                Where applicable, we process personal information based on one or more of the
                following legal grounds:
              </p>
              <List
                items={[
                  "Your consent",
                  "Performance of a contract",
                  "Compliance with legal obligations",
                  "Protection of vital interests",
                  "Legitimate business interests",
                  "Public interest where applicable",
                ]}
              />
            </Section>

            <Section number="5" title="How We Share Information">
              <p>
                We do not sell your personal information except as described in this Privacy
                Policy or where permitted by applicable law.
              </p>
              <p>We may share information with:</p>

              <p className="text-foreground font-medium">Service Providers</p>
              <p>Such as companies providing:</p>
              <List
                items={[
                  "Payment processing",
                  "Website hosting",
                  "Cloud storage",
                  "Email delivery",
                  "Customer support",
                  "Marketing",
                  "Analytics",
                  "Fraud prevention",
                  "Security monitoring",
                ]}
              />
              <p>These providers are contractually required to protect your information.</p>

              <p className="text-foreground font-medium">Business Transfers</p>
              <p>
                If we merge, are acquired, reorganize, or sell assets, your information may be
                transferred.
              </p>

              <p className="text-foreground font-medium">Legal Requirements</p>
              <p>We may disclose information when required by law, including:</p>
              <List
                items={[
                  "Court orders",
                  "Government requests",
                  "Legal proceedings",
                  "Law enforcement investigations",
                  "Regulatory compliance",
                ]}
              />

              <p className="text-foreground font-medium">Protection of Rights</p>
              <p>We may disclose information to:</p>
              <List
                items={[
                  "Protect our legal rights",
                  "Prevent fraud",
                  "Investigate abuse",
                  "Enforce our Terms of Service",
                  "Protect users and the public",
                ]}
              />
            </Section>

            <Section number="6" title="Marketing Communications">
              <p>If you subscribe to marketing communications, we may send:</p>
              <List items={["Promotional emails", "Product announcements", "Newsletters", "Offers", "Surveys"]} />
              <p>You may unsubscribe at any time using the unsubscribe link or by contacting us.</p>
            </Section>

            <Section number="7" title="Analytics">
              <p>
                We may use third-party analytics providers to understand website performance and
                user behavior.
              </p>
              <p>Analytics providers may collect:</p>
              <List
                items={[
                  "Device identifiers",
                  "Browser information",
                  "Session duration",
                  "Referral sources",
                  "Interaction events",
                ]}
              />
            </Section>

            <Section number="8" title="Advertising">
              <p>We may use advertising partners to display personalized advertisements.</p>
              <p>Advertising technologies may use:</p>
              <List items={["Cookies", "Pixels", "Device identifiers"]} />
              <p>You may opt out where applicable through available privacy controls.</p>
            </Section>

            <Section number="9" title="Data Retention">
              <p>We retain personal information only as long as necessary to:</p>
              <List
                items={[
                  "Provide services",
                  "Fulfill contractual obligations",
                  "Comply with legal requirements",
                  "Resolve disputes",
                  "Enforce agreements",
                  "Protect our business",
                ]}
              />
              <p>Retention periods vary depending on the type of information.</p>
            </Section>

            <Section number="10" title="Data Security">
              <p>
                We implement reasonable administrative, technical, and physical safeguards
                designed to protect personal information.
              </p>
              <p>Examples include:</p>
              <List
                items={[
                  "Encryption",
                  "Access controls",
                  "Secure servers",
                  "Firewalls",
                  "Authentication procedures",
                  "Employee confidentiality obligations",
                  "Security monitoring",
                ]}
              />
              <p>No method of electronic transmission or storage is completely secure.</p>
            </Section>

            <Section number="11" title="International Data Transfers">
              <p>
                By using our services, you acknowledge that you have read this Privacy Policy and
                consent to the collection, use, and disclosure of your information as described
                herein, where information may be transferred to and processed in countries other
                than your own.
              </p>
              <p>
                Where required, we implement appropriate safeguards to protect transferred
                personal information.
              </p>
            </Section>

            <Section number="12" title="Children's Privacy">
              <p>
                Our services are not intended for children under the age of 13 (or the applicable
                age in your jurisdiction).
              </p>
              <p>We do not knowingly collect personal information from children.</p>
              <p>If we learn that we have collected such information, we will promptly delete it.</p>
            </Section>

            <Section number="13" title="Your Privacy Rights">
              <p>Depending on your jurisdiction, you may have rights including:</p>
              <List
                items={[
                  "Access your personal information",
                  "Correct inaccurate information",
                  "Delete your information",
                  "Restrict processing",
                  "Object to processing",
                  "Withdraw consent",
                  "Data portability",
                  "Opt out of certain marketing",
                  "Opt out of targeted advertising",
                  "Appeal certain privacy decisions",
                ]}
              />
              <p>We may verify your identity before processing requests.</p>
            </Section>

            <Section number="14" title="California Privacy Rights">
              <p>
                California residents may have rights under applicable California privacy laws,
                including the right to:
              </p>
              <List
                items={[
                  "Know what personal information is collected",
                  "Request deletion",
                  "Request correction",
                  "Access collected information",
                  "Opt out of certain sharing or selling of personal information",
                  "Limit the use of sensitive personal information where applicable",
                  "Receive equal service regardless of exercising privacy rights",
                ]}
              />
              <p>We will not discriminate against individuals for exercising applicable privacy rights.</p>
            </Section>

            <Section number="15" title="European Privacy Rights">
              <p>
                Individuals located in the European Economic Area, United Kingdom, or Switzerland
                may have rights including:
              </p>
              <List
                items={[
                  "Access",
                  "Rectification",
                  "Erasure",
                  "Restriction",
                  "Objection",
                  "Portability",
                  "Withdrawal of consent",
                  "Filing complaints with supervisory authorities",
                ]}
              />
            </Section>

            <Section number="16" title="Do Not Track Signals">
              <p>Some browsers offer a &quot;Do Not Track&quot; feature.</p>
              <p>
                Because there is no universally accepted standard, our services may not respond
                to all Do Not Track signals.
              </p>
            </Section>

            <Section number="17" title="Third-Party Links">
              <p>Our website may contain links to third-party websites.</p>
              <p>We are not responsible for the privacy practices of those third parties.</p>
              <p>We encourage users to review their privacy policies.</p>
            </Section>

            <Section number="18" title="Changes to This Privacy Policy">
              <p>We may update this Privacy Policy periodically.</p>
              <p>Changes become effective upon posting the updated version.</p>
              <p>
                Material changes may be communicated through additional notice where required by
                law.
              </p>
            </Section>

            <Section number="19" title="Contact Information">
              <p>
                If you have questions about this Privacy Policy or your personal information,
                contact us:
              </p>
              <p className="text-foreground font-medium">NextGen Media</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:nextgenmediaoutreach@gmail.com"
                  className="text-primary underline underline-offset-4"
                >
                  nextgenmediaoutreach@gmail.com
                </a>
              </p>
              <p>
                Phone:{" "}
                <a href="tel:8564495318" className="text-primary underline underline-offset-4">
                  856-449-5318
                </a>
              </p>
              <p>Mailing Address: South Jersey, United States</p>
            </Section>

            <Section number="20" title="Data Protection Requests">
              <p>To exercise your privacy rights, contact us at:</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:nextgenmediaoutreach@gmail.com"
                  className="text-primary underline underline-offset-4"
                >
                  nextgenmediaoutreach@gmail.com
                </a>
              </p>
              <p>Please include:</p>
              <List items={["Your full name", "Contact information", "Description of your request"]} />
              <p>We may request additional information to verify your identity before fulfilling requests.</p>
            </Section>

            <Section number="21" title="Consent">
              <p>
                By accessing or using our services, you acknowledge that you have read this
                Privacy Policy and consent to the collection, use, and disclosure of your
                information as described herein, where consent is the applicable legal basis for
                processing.
              </p>
            </Section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
