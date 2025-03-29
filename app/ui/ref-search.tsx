'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function RefSearch({ callback, term, elementIdPrefix }: 
  { callback: (term: string) => void; term: string; elementIdPrefix: string; }) {

  const handleSearch = useDebouncedCallback((term) => {

    callback(term);
 
  }, 100);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor={elementIdPrefix + 'search'} className="sr-only">
        Search
      </label>
      <input
        id={elementIdPrefix + 'search'}
        className="peer block w-full h-10 rounded-md border border-gray-300 group-focus-within:border-blue-500
        py-[9px] pl-10 text-sm placeholder:text-gray-500"
        placeholder="найти ..."
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        onFocus={(e) => e.target.style.borderColor = '#3b82f6'} // blue-500
        onBlur={(e) => e.target.style.borderColor = '#d2d6dc'}  // gray-300
        value={term}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
