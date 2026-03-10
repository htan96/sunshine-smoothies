"use client" 

type FuelBalances = {
  medium: number;
  large: number;
  xl: number;
  jumbo: number;
};

type Props = {
  phoneRequired: boolean;
  phone: string;
  handlePhoneChange: (value: string) => void;
  fuelBalances: FuelBalances;
  checkFuelBalance: () => void;
};

export default function CartFuelRedemption({
  phoneRequired,
  phone,
  handlePhoneChange,
  fuelBalances,
  checkFuelBalance,
}: Props) {
  if (!phoneRequired) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-widest text-neutral-400">
        Phone Number Required
      </p>

      <input
        type="tel"
        value={phone}
        onChange={(e) => handlePhoneChange(e.target.value)}
        onBlur={checkFuelBalance}
        placeholder="Enter phone number"
        className="w-full bg-neutral-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
      />

      {phone && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-4 space-y-2">
          <p className="text-sm font-semibold text-green-900">
            Fuel Balance
          </p>

          <div className="flex justify-between text-sm">
            <span>Medium</span>
            <span>{fuelBalances.medium}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Large</span>
            <span>{fuelBalances.large}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>XL</span>
            <span>{fuelBalances.xl}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Jumbo</span>
            <span>{fuelBalances.jumbo}</span>
          </div>
        </div>
      )}
    </div>
  );
}