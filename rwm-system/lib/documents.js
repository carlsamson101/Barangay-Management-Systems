import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import QRCode from "react-native-qrcode-svg";
import React from "react";
import { View } from "react-native";

// ✅ Helper to compute current date
const formatDate = () => {
  const date = new Date();
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ✅ Generate Certificate of Indigency
export const generateCertificateOfIndigency = async (resident) => {
  const html = `
  <div style="font-family: Arial; padding: 30px; text-align: center;">
    <h2 style="text-transform: uppercase;">Republic of the Philippines</h2>
    <h3>Barangay ${resident.barangay}</h3>
    <h1 style="margin-top: 20px;">CERTIFICATE OF INDIGENCY</h1>
    <p style="margin-top: 30px; text-align: justify; line-height: 1.6;">
      This is to certify that <b>${resident.firstName} ${resident.middleName || ""} ${resident.lastName}</b>,
      ${resident.age}-year-old resident of <b>Purok ${resident.purok}</b>, Barangay ${resident.barangay},
      is known to this office as a <b>bonafide indigent resident</b>.
    </p>

    <p style="margin-top: 20px; text-align: justify; line-height: 1.6;">
      This certification is issued upon the request of the above-named person for <b>${resident.purpose || "official purposes"}</b>.
    </p>

    <p style="margin-top: 20px;">Issued this ${formatDate()} at Barangay ${resident.barangay}.</p>

    <div style="margin-top: 60px; text-align: right; margin-right: 80px;">
      <b>______________________________</b><br/>
      <b>Punong Barangay</b>
    </div>
  </div>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri);
};

// ✅ Generate Letter of Summon
export const generateLetterOfSummon = async (resident) => {
  const html = `
  <div style="font-family: Arial; padding: 30px;">
    <h2 style="text-align:center;">Republic of the Philippines</h2>
    <h3 style="text-align:center;">Barangay ${resident.barangay}</h3>
    <h1 style="text-align:center;">LETTER OF SUMMON</h1>

    <p style="margin-top: 30px; text-align: justify; line-height: 1.6;">
      To: <b>${resident.firstName} ${resident.lastName}</b><br/>
      Address: ${resident.purok}, Barangay ${resident.barangay}
    </p>

    <p style="margin-top: 20px; text-align: justify; line-height: 1.6;">
      You are hereby summoned to appear before the Barangay Captain on <b>${formatDate()}</b>
      at the Barangay Hall for an important matter concerning community peace and order.
    </p>

    <p style="margin-top: 20px;">Failure to appear may result in further barangay action as prescribed by law.</p>

    <div style="margin-top: 60px; text-align: right; margin-right: 80px;">
      <b>______________________________</b><br/>
      <b>Punong Barangay</b>
    </div>
  </div>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri);
};
