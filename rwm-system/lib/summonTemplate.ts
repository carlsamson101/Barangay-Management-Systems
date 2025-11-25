export const summonTemplate = (item, fullName, formatDatePH) => `
  <div style="font-family: Arial; padding: 30px;">
    <h2 style="text-align:center; margin:0;">Republic of the Philippines</h2>
    <h3 style="text-align:center; margin:6px 0;">Barangay ${item.barangay || ""}</h3>
    <h1 style="text-align:center; margin: 18px 0;">LETTER OF SUMMON</h1>

    <p style="text-align: justify; line-height: 1.6;">
      To: <b>${fullName(item)}</b><br/>
      Address: ${item.street ? item.street + ", " : ""}${item.purok ? `Purok ${item.purok}, ` : ""}Barangay ${item.barangay || ""}
    </p>

    <p style="margin-top: 14px; text-align: justify; line-height: 1.6;">
      You are hereby summoned to appear before the Barangay Captain on <b>${formatDatePH()}</b>
      at the Barangay Hall regarding an important matter.
    </p>

    <p style="margin-top: 14px;">Failure to appear may result in further barangay action.</p>

    <div style="margin-top: 60px; text-align: right; margin-right: 80px;">
      <b>______________________________</b><br/>
      <b>Punong Barangay</b>
    </div>
  </div>
`;
