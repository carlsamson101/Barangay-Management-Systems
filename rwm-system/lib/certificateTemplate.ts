export const certificateTemplate = (
  item,
  purpose,
  fullName,
  formatDatePH,
  barangayLogoUrl,
  barangayCaptain // This will be fetched from profile
) => `
  <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto;">

    <!-- Barangay Logo -->
    ${
      barangayLogoUrl
        ? `<div style="text-align: center; margin-bottom: 16px;">
            <img src="${barangayLogoUrl}"
              style="width: 120px; height: 120px; object-fit: contain;" />
          </div>`
        : ""
    }

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="text-transform: uppercase; margin: 0; font-size: 16px; font-weight: normal;">
        Republic of the Philippines
      </h2>
      <h3 style="margin: 4px 0; font-size: 14px; font-weight: normal;">
        Lanao Del Norte
      </h3>
      <h3 style="margin: 4px 0; font-size: 14px; font-weight: normal;">
        Iligan City
      </h3>
      <h2 style="margin: 4px 0 20px 0; font-size: 18px; font-weight: bold; text-transform: uppercase;">
        ${item.barangay || "BARANGAY"}
      </h2>
      
      <div style="border-top: 2px solid #000; width: 80px; margin: 15px auto;"></div>
      
      <h1 style="margin: 20px 0; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
        CERTIFICATE OF INDIGENCY
      </h1>
    </div>

    <!-- TO WHOM IT MAY CONCERN -->
    <div style="text-align: center; margin: 30px 0 20px 0;">
      <p style="font-size: 16px; font-weight: bold; margin: 0;">TO WHOM IT MAY CONCERN:</p>
    </div>

    <!-- Body Content -->
    <div style="text-align: justify; line-height: 2; font-size: 15px; text-indent: 50px;">
      <p style="margin: 0 0 20px 0;">
        This is to certify that <b style="text-transform: uppercase;">${fullName(item)}</b>,
        ${item.age ? `<b>${item.age}</b> years old, ` : ""}
        ${item.sex ? `<b>${item.sex}</b>, ` : ""}
        ${item.civilStatus ? `<b>${item.civilStatus}</b>, ` : ""}
        is a <b>bonafide resident</b> of 
        <b>${item.street ? item.street + ", " : ""}Purok ${item.purok || ""}, ${item.barangay || ""}</b>.
      </p>

      <p style="margin: 0 0 20px 0;">
        This is to certify further that the above-named person belongs to an <b>INDIGENT FAMILY</b> 
        in this barangay based on the records available in this office.
      </p>

      <p style="margin: 0 0 20px 0;">
        This certification is issued upon the request of the above-named person for 
        <b style="text-transform: uppercase;">${purpose || "WHATEVER LEGAL PURPOSES IT MAY SERVE"}</b>.
      </p>
    </div>

    <!-- Date and Place -->
    <div style="text-align: justify; margin: 30px 0; font-size: 15px; text-indent: 50px;">
      <p style="margin: 0;">
        Issued this <b>${formatDatePH()}</b> at <b>${item.barangay || "Barangay Hall"}</b>.
      </p>
    </div>

    <!-- Signature Section - Only Captain -->
    <div style="margin-top: 100px; text-align: center;">
      ${
        barangayCaptain
          ? `<div style="margin-bottom: 10px;">
              <p style="margin: 0; font-weight: bold; font-size: 17px; text-transform: uppercase; text-decoration: underline;">
                ${barangayCaptain}
              </p>
            </div>`
          : `<div style="margin-bottom: 10px; border-bottom: 2px solid #000; width: 300px; margin-left: auto; margin-right: auto;"></div>`
      }
      <p style="margin: 0; font-weight: bold; font-size: 16px;">Punong Barangay</p>
    </div>

    <!-- Optional: Document Control Number -->
    <div style="margin-top: 60px; text-align: left; font-size: 11px; color: #666;">
      <p style="margin: 0;">Control No: _________________</p>
      <p style="margin: 4px 0 0 0;">O.R. No: _________________</p>
    </div>

    <!-- Not Valid Without Official Seal -->
    <div style="margin-top: 20px; text-align: center; font-size: 12px; font-style: italic; color: #666;">
      <p style="margin: 0;">Not valid without official seal</p>
    </div>

  </div>
`;