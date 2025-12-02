export const summonTemplate = (
  item,
  fullName,
  formatDatePH,
  barangayLogoUrl,
  barangayCaptain, // Add this parameter
  summonDate, // Optional: specific date for appearance
  summonTime, // Optional: specific time for appearance
  reason // Optional: reason for summon
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
        LETTER OF SUMMON
      </h1>
    </div>

    <!-- Date Issued -->
    <div style="text-align: right; margin-bottom: 30px; font-size: 14px;">
      <p style="margin: 0;">Date: <b>${formatDatePH()}</b></p>
    </div>

    <!-- Recipient Information -->
    <div style="margin-bottom: 30px; font-size: 15px;">
      <p style="margin: 0 0 8px 0;"><b>TO:</b></p>
      <p style="margin: 0 0 4px 0; margin-left: 30px;">
        <b style="text-transform: uppercase;">${fullName(item)}</b>
      </p>
      <p style="margin: 0; margin-left: 30px;">
        ${item.street ? item.street + ", " : ""}${item.purok ? `Purok ${item.purok}, ` : ""}${item.barangay || ""}
      </p>
    </div>

    <!-- Greeting -->
    <div style="margin-bottom: 20px; font-size: 15px;">
      <p style="margin: 0;">Dear ${item.sex === "Male" ? "Mr." : item.sex === "Female" ? "Ms." : ""} ${item.lastName || fullName(item)}:</p>
    </div>

    <!-- Body Content -->
    <div style="text-align: justify; line-height: 2; font-size: 15px;">
      <p style="margin: 0 0 20px 0; text-indent: 50px;">
        You are hereby summoned to appear before the Office of the Punong Barangay 
        on <b>${summonDate || formatDatePH()}</b>${summonTime ? ` at <b>${summonTime}</b>` : ""} 
        at the <b>${item.barangay || ""} Barangay Hall</b>.
      </p>

      ${
        reason
          ? `<p style="margin: 0 0 20px 0; text-indent: 50px;">
              <b>Purpose:</b> ${reason}
            </p>`
          : `<p style="margin: 0 0 20px 0; text-indent: 50px;">
              This summon is in connection with a matter that requires your immediate attention 
              and personal appearance before this office.
            </p>`
      }

      <p style="margin: 0 0 20px 0; text-indent: 50px;">
        Your prompt compliance and cooperation in this matter is highly expected. 
        <b>Failure to appear on the scheduled date and time without valid reason may result 
        in appropriate barangay action</b> in accordance with existing laws and barangay ordinances.
      </p>

      <p style="margin: 0; text-indent: 50px;">
        For any concerns or clarifications, you may contact the Barangay Office during 
        regular office hours.
      </p>
    </div>

    <!-- Closing -->
    <div style="margin-top: 40px; font-size: 15px;">
      <p style="margin: 0;">Very truly yours,</p>
    </div>

    <!-- Signature Section -->
    <div style="margin-top: 60px; text-align: center;">
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

    <!-- Received Copy -->
    <div style="margin-top: 80px; border-top: 1px solid #ccc; padding-top: 20px;">
      <p style="margin: 0 0 30px 0; font-size: 14px; font-weight: bold;">RECEIVED BY:</p>
      <div style="display: flex; justify-content: space-between; font-size: 14px;">
        <div style="width: 45%;">
          <div style="border-bottom: 2px solid #000; margin-bottom: 6px;"></div>
          <p style="margin: 0; text-align: center;">Signature Over Printed Name</p>
        </div>
        <div style="width: 45%;">
          <div style="border-bottom: 2px solid #000; margin-bottom: 6px;"></div>
          <p style="margin: 0; text-align: center;">Date</p>
        </div>
      </div>
    </div>

    

  </div>
`;