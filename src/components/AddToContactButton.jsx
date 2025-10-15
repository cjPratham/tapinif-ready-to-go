import { useState } from "react";
import { FaAddressBook, FaCheckCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AddToContactsButton = ({ name, phone, company, profileUrl }) => {
  const [saved, setSaved] = useState(false);

  const handleAddToContacts = () => {
    if (!name || !phone) return;

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
    <motion.button
      onClick={handleAddToContacts}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden flex items-center justify-center gap-2 font-semibold px-6 py-2.5 rounded-md 
        transition-all duration-300 shadow-lg backdrop-blur-sm
        ${
          saved
            ? "bg-gradient-to-r from-green-500 to-green-400 text-white"
            : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-xl"
        }`}
    >
      {/* Subtle glowing gradient ring effect */}
      <span
        className={`absolute inset-0 opacity-0 blur-md transition-opacity duration-500 ${
          saved
            ? "bg-green-400/40 opacity-60"
            : "bg-blue-400/30 group-hover:opacity-60"
        }`}
      ></span>

      <AnimatePresence mode="wait" initial={false}>
        {saved ? (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 z-10"
          >
            <FaCheckCircle size={18} />
            <span>Contact Opened!</span>
          </motion.div>
        ) : (
          <motion.div
            key="add"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 z-10"
          >
            {/* <FaAddressBook size={18} /> */}
            <span>Add to Contacts</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default AddToContactsButton;
