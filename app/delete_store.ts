import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";
import { Section } from "./lib/definitions";
import { fetchSections_deprecated } from "./admin/sections/lib/sections-actions";

type State = {
    sections: Section[];
    selectedSection: Section | null;
}
type GetSectionsAction = {
    type: 'getSections';
    payload: Section[];
} 
type UpdateSectionAction = {
    type: 'updateSection';
    payload: Section;
}
type SelectSectionAction = {
    type: 'selectSection';
    payload: Section;
}
type Action = GetSectionsAction | UpdateSectionAction | SelectSectionAction;

const sections: Section[] = await fetchSections_deprecated();
const initialState: State = {
    sections: sections,
    selectedSection: null
}

// редьюсер - это чистая функция, которая принимает предыдущее состояние, 
// экшн и возвращает новое состояние
const reducer = (state = initialState, action: Action): State => {
    switch (action.type) {
        case 'getSections':
            return { ...state, sections: action.payload };
        case 'updateSection':
            return { ...state, sections: state.sections.map((section) => section.id === action.payload.id ? action.payload : section) };
        case 'selectSection':
            return { ...state, selectedSection: action.payload };
        default:
            return state;
    }
}

export const store = configureStore({
    reducer: reducer,
  });
