import Head from 'next/head';

interface MetaProps {
  title?: string;
  description?: string;
  image?: string;
}

export default function Meta({
  title = "TrustTerms - AI Contract Risk Analysis for SaaS Agreements",
  description = "Instant AI-powered analysis of SaaS contracts. Identify hidden risks, auto-renewals, and liability issues before signing. Built for startup CFOs and operators.",
  image = "/og-image.png"
}: MetaProps) {
  const url = "https://trustterms.vercel.app";
 
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
     
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${url}${image}`} />
     
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${url}${image}`} />
     
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
     
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "TrustTerms",
            "applicationCategory": "BusinessApplication",
            "description": "AI-powered SaaS contract risk analysis for startups and CFOs",
            "offers": {
              "@type": "Offer",
              "price": "149",
              "priceCurrency": "SEK"
            }
          })
        }}
      />
    </Head>
  );
}