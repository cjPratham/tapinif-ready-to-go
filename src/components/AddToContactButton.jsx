import { useState } from "react";
import { FaAddressBook, FaCheckCircle } from "react-icons/fa";

const AddToContactsButton = ({ name, phone, company, profileUrl }) => {
  const [saved, setSaved] = useState(false);

  const handleAddToContacts = () => {
    const vCard = `
BEGIN:VCARD
VERSION:3.0
FN:${name}
ORG:${company || "Tapinfi"}
TEL;TYPE=cell:${phone}
URL:${profileUrl}
END:VCARD
    `.trim();

    const blob = new Blob([vCard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.replace(/\s+/g, "_")}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <button
      onClick={handleAddToContacts}
      className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-full shadow-md transition-all ${
        saved ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
    >
      {saved ? <FaCheckCircle size={18} /> : <FaAddressBook size={18} />}
      {saved ? "Contact Opened!" : "Add to Contacts"}
    </button>
  );
};

export default AddToContactsButton;
