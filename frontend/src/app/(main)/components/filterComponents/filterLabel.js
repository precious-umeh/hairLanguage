"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function FilterLabel({ content, param, value }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if this specific option is currently active in the URL
  const isActive = searchParams.get(param) === value;

  const handleChange = () => {
    // Navigate to the new filtered URL
    // router.push(`/shop?${param}=${value}`);

    // Setting the param automatically overwrites the old value
    // for that specific key (e.g., texture=straight becomes texture=curly)
    const params = new URLSearchParams(searchParams.toString());
    if (isActive) {
      params.delete(param);
    } else {
      params.set(param, value);
    }
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer relative group">
      <input
        type="checkbox"
        checked={isActive}
        onChange={handleChange}
        className="absolute w-3 h-3 opacity-0 cursor-pointer peer z-10"
      />

      <div
        className="w-4 h-4 border border-(--textMuted) rounded-sm flex items-center justify-center 
        peer-checked:bg-(--accent) peer-checked:border-(--accent) transition-all duration-200"
      >
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <span
        // href={`/shop?${param}=${value}`}
        className="group-hover:underline underline-offset-3"
      >
        {content}
      </span>
    </label>
  );
}
