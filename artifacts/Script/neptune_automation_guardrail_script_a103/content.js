// Guardrail: block content that mentions SAP or SAP-related products/tech

result = true;

try {
  const text = (payload?.content || "").trim();
  if (!text) {
    result = { allow: true, reason: "Empty content." };
    complete();
    return;
  }

  const lc = text.toLowerCase();

  const terms = [
    { label: "SAP (acronym)", re: /\bSAP\b/ },
    { label: "S/4HANA", re: /\bs\/?4hana\b/i },
    { label: "ABAP", re: /\babap\b/i },
    { label: "HANA", re: /\bhana\b/i },
    { label: "SAPUI5", re: /\bsapui5\b/i },
    { label: "OpenUI5", re: /\bopenui5\b/i },
    { label: "SAP BTP", re: /\bsap\s+btp\b/i },
    { label: "NetWeaver", re: /\bnetweaver\b/i },
    { label: "SuccessFactors", re: /\bsuccessfactors\b/i },
    { label: "Ariba", re: /\bariba\b/i },
    { label: "Concur", re: /\bconcur\b/i },
    { label: "Fieldglass", re: /\bfieldglass\b/i },
    { label: "SAP Fiori", re: /\bsap\s+fiori\b/i },
    { label: "SAP CAP", re: /\bsap\s+cap\b/i },
    { label: "ABAP CDS", re: /\babap\s+cds\b/i },
    { label: "SAP CDS", re: /\bsap\s+cds\b/i }
  ];

  const matches = [];
  for (const t of terms) {
    if (t.re.test(text)) matches.push(t.label);
  }

  const hasLowercaseSapVerbOnly =
    /\bsap\b/.test(lc) && !/\bSAP\b/.test(text) && matches.length === 0;

  if (matches.length > 0 && !hasLowercaseSapVerbOnly) {
    result = {
      allow: false,
      reason: `Blocked: content references SAP-related terms (${[...new Set(matches)].join(", ")}).`
    };
  } else {
    result = true;
  }
} catch (e) {
  result = { allow: false, reason: `Guardrail error: ${e.message}` };
}

complete();