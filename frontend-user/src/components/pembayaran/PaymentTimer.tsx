import { Clock } from "lucide-react";

interface PaymentTimerProps {
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

const PaymentTimer: React.FC<PaymentTimerProps> = ({ timeLeft }) => {
  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl px-4 py-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span className="text-sm font-medium opacity-95">
            Selesaikan dalam
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="bg-white/20 rounded-lg px-2.5 py-1.5 text-center">
            <span className="font-display font-bold text-xl leading-none">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-[9px] opacity-80 block">Jam</span>
          </div>
          <span className="text-lg font-bold opacity-70">:</span>
          <div className="bg-white/20 rounded-lg px-2.5 py-1.5 text-center">
            <span className="font-display font-bold text-xl leading-none">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-[9px] opacity-80 block">Menit</span>
          </div>
          <span className="text-lg font-bold opacity-70">:</span>
          <div className="bg-white/20 rounded-lg px-2.5 py-1.5 text-center">
            <span className="font-display font-bold text-xl leading-none">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="text-[9px] opacity-80 block">Detik</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTimer;
