export const certificateTemplate = (item, purpose, fullName, formatDatePH) => `
  <div style="font-family: Arial; padding: 30px; text-align: center;">
    <h2 style="text-transform: uppercase; margin:0;">Republic of the Philippines</h2>
    <h3 style="margin:6px 0;">Barangay ${item.barangay || ""}</h3>
    <h1 style="margin: 18px 0;">CERTIFICATE OF INDIGENCY</h1>
    <p style="margin-top: 18px; text-align: justify; line-height: 1.6;">
      This is to certify that <b>${fullName(item)}</b>,
      ${item.age ? `${item.age}-year-old` : ""} resident of <b>${item.street ? item.street + ", " : ""}Purok ${item.purok || ""}</b>,
      Barangay ${item.barangay || ""}, is known to this office as a <b>bonafide indigent resident</b>.
    </p>
    <p style="margin-top: 14px; text-align: justify; line-height: 1.6;">
      This certification is issued for <b>${purpose || "official purposes"}</b>.
    </p>
    <p style="margin-top: 14px;">Issued this ${formatDatePH()} at Barangay ${item.barangay || ""}.</p>
    <div style="margin-top: 60px; text-align: right; margin-right: 80px;">
      <b>______________________________</b><br/>
      <b>Punong Barangay</b>
    </div>
  </div>
`;
