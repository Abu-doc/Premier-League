import { motion } from "framer-motion";

function Card({ children }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="glass p-6 rounded-2xl glow"
    >
      {children}
    </motion.div>
  );
}

export default Card;