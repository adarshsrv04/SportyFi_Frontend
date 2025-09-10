import React from "react";

interface MatchDateFilterProps {
    selectedDate: string | null; // now string in desired format
    onDateChange: (date: string | null) => void;
}

const formatDateToInput = (d: string | null) => {
    if (!d) return "";
    return d.slice(0, 10); // extract YYYY-MM-DD for input value
};

const formatToTimestamp = (val: string): string => {
    const [y, m, d] = val.split("-").map(Number);
    const dt = new Date(y, m - 1, d);

    // build YYYY-MM-DD HH:mm:ss±HH:MM
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");

    // const hh = String(dt.getHours()).padStart(2, "0");
    // const min = String(dt.getMinutes()).padStart(2, "0");
    // const ss = String(dt.getSeconds()).padStart(2, "0");

    // timezone offset in minutes
    // const offset = -dt.getTimezoneOffset();
    // const sign = offset >= 0 ? "+" : "-";
    // const offsetH = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
    // const offsetM = String(Math.abs(offset) % 60).padStart(2, "0");

    // return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}${sign}${offsetH}:${offsetM}`;
    return `${yyyy}-${mm}-${dd}`;
};

const MatchDateFilter: React.FC<MatchDateFilterProps> = ({
    selectedDate,
    onDateChange,
}) => {
    return (
        // <div className="w-full md:w-48">
        //     <input
        //         type="date"
        //         className="w-full border rounded px-2 py-1"
        //         value={formatDateToInput(selectedDate)}
        //         onChange={(e) => {
        //             const val = e.target.value;
        //             if (!val) {
        //                 onDateChange(null);
        //                 return;
        //             }
        //             onDateChange(formatToTimestamp(val));
        //         }}
        //     />
        // </div>
        <div className="relative w-full md:w-48">
            {!selectedDate && (
                <span className="absolute left-3 top-2 text-gray-400 pointer-events-none">
                    Select Date
                </span>
            )}
            <input
                type="date"
                className={`w-full border rounded px-2 py-1 relative z-10 bg-transparent
          ${!selectedDate ? "[&::-webkit-datetime-edit]:text-transparent" : ""}`}
                value={selectedDate || ""}
                onChange={(e) => onDateChange(e.target.value || null)}
            />
        </div>
    );
};

export default MatchDateFilter;
