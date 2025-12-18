import React, { JSX } from 'react';

interface IInputFieldProps {
    label: string; // Текст метки
    name: string; // Имя поля
    value: string; // Значение поля
    w: string[]; // ширина элементов label/input, например w = ["w-6/16", "w-10/16"]
    type: string; // type для input-элемента
    onChange: (value: string | Date) => void; // Функция для обновления значения
    refBook?: JSX.Element;
    readonly: boolean;
    errors?: string[]; // Массив ошибок
    textArea?: boolean
}

const InputField: React.FC<IInputFieldProps> = ({
    label,
    name,
    value,
    w,
    type,
    onChange,
    refBook,
    readonly,
    errors,
    textArea,
}) => {
    const labelClassName = `${w[0]} text-sm text-blue-900 font-medium flex items-center p-2`;
    // const inputClassName = `${w[1]} ${moreInputClassName} control rounded-md border border-gray-200 p-2`;
    // `${inputClassName} break-words`
    const inputClassName = `${w[1]} disabled:text-gray-400 disabled:bg-gray-100 break-words control rounded-md border border-gray-200 p-2`;

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
                {!textArea && <input
                    id={name}
                    type={type}
                    name={name}
                    className={inputClassName}
                    disabled={readonly}
                    value={value}
                    onChange={type !== "date"
                        ? (e) => onChange(e.target.value)
                        : (e) => onChange(new Date(e.target.value))}
                />}
                {textArea && <textarea
                    id={name}
                    // type={type}
                    name={name}
                    // className={inputClassName}
                    disabled={readonly}
                    value={value}
                    onChange={type !== "date"
                        ? (e) => onChange(e.target.value)
                        : (e) => onChange(new Date(e.target.value))}
                    className="w-full break-words rounded-md border border-gray-200 p-2" />}
                {!readonly && refBook}
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