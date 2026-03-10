type Props = {
  selectedLocation: any;
};

export default function CartLocation({ selectedLocation }: Props) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">
        Pickup Location
      </p>

      <div className="bg-neutral-100 rounded-2xl px-5 py-4">
        <p className="text-sm font-medium text-neutral-800">
          {selectedLocation?.name}
        </p>

        <p className="text-xs text-neutral-500 mt-1">
          {selectedLocation?.address}
        </p>
      </div>
    </div>
  );
}