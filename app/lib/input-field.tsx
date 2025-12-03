import React, { JSX } from 'react';

interface InputFieldProps {
    label: string; // Текст метки
    name: string; // Имя поля
    value: string; // Значение поля
    w: string[]; // ширина элементов label/input, например w = ["w-6/16", "w-10/16"]
    type: string; // type для input-элемента
    onChange: (value: string | Date) => void; // Функция для обновления значения
    refBook?: JSX.Element
    errors?: string[]; // Массив ошибок
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    name,
    value,
    w,
    type,
    onChange,
    refBook,
    errors,
}) => {
    const labelClassName = `${w[0]} text-sm text-blue-900 font-medium flex items-center p-2`;
    const inputClassName = `${w[1]} control rounded-md border border-gray-200 p-2`;
    return (

        <div className="flex-col">
            {/* Блок с меткой и полем ввода */}
            <div className="flex justify-between mt-1">
                <label
                    htmlFor={name}
                    className={labelClassName}
                >
                    {label}
                </label>
                <input
                    id={name}
                    type={type}
                    name={name}
                    className={inputClassName}
                    value={value}
                    onChange={type !== "date"
                        ? (e) => onChange(e.target.value)
                        : (e) => onChange(new Date(e.target.value))}
                />
                {refBook}
            </div>

            {/* Блок с выводом ошибок */}
            <div id={`${name}-error`} aria-live="polite" aria-atomic="true">
                {errors &&
                    errors.map((error, index) => (
                        <p className="mt-2 text-xs text-red-500" key={index}>
                            {error}
                        </p>
                    ))}
            </div>
        </div>
    );
};

export default InputField;