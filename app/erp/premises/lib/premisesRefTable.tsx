import { Premise } from "@/app/lib/definitions";
import RefSearch from "@/app/ui/ref-search";
import { useState } from "react";

interface IPremisesRefTableProps {
    premises: Premise[],
    handleSelectPremise: (new_premise_id: string, new_premise_name: string) => void,
    closeModal: () => void,
    setTerm: (value: string) => void,
    term: string,
}

export default function PremisesRefTable(props: IPremisesRefTableProps) {

    const handleSearch = (input: string) => {
        props.setTerm(input);
    }
    return (
        <div className="w-full">
            <p>Выберите помещение:</p>
            <RefSearch callback={handleSearch} term={props.term} elementIdPrefix=""/>
            <div className="mt-0 flow-root">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden rounded-md bg-gray-50 p-1 md:pt-0">
                            <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                                    <tr>
                                        <th scope="col" className="w-1/2 overflow-hidden px-0 py-5 font-medium sm:pl-6">
                                            Название
                                        </th>
                                        <th scope="col" className="w-6/16 px-3 py-5 font-medium">
                                            Тип
                                        </th>
                                        <th scope="col" className="w-1/8 px-3 py-5 font-medium">
                                            Адрес
                                        </th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        {/* область прокрутки */}
                        <div className="max-h-[300px] overflow-y-auto rounded-md bg-gray-50 p-2 md:pt-0">
                            <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                                <tbody className="divide-y divide-gray-200 text-gray-900">
                                    {props.premises.map((premise) => ((
                                        premise.name.toLowerCase().includes(props.term.toLowerCase()) 
                                        || props.term.length === 0) &&
                                        <tr key={premise.id} className="group">
                                            <td className="w-1/2 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left  
                          pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                                                <div className="flex items-left gap-3">
                                                    <a
                                                        onClick={(e) => { 
                                                            props.handleSelectPremise(premise.id, premise.name);
                                                            props.setTerm(""); 
                                                            props.closeModal(); 
                                                        }}
                                                        // href={"#"}
                                                        className="text-blue-800 underline cursor-pointer hover:text-blue-600"
                                                    >{premise.name.substring(0, 36)}</a>
                                                </div>
                                            </td>
                                            <td className="w-6/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                                                {premise.type}
                                            </td>
                                            <td className="w-1/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                                                {premise.address}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
