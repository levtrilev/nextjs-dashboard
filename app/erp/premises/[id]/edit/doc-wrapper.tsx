'use client';

import { DocUserPermissions, SectionForm, User } from "@/app/lib/definitions";
import { fetchAllTags } from "@/app/lib/tags/tags-actions";
import { setIsCancelButtonPressed, setIsDocumentChanged, setIsMessageBoxOpen, setIsOKButtonPressed, setIsShowMessageBoxCancel, setMessageBoxText, useDocumentStore, useIsDocumentChanged, useMessageBox } from "@/app/store/useDocumentStore";
import { useEffect } from "react";

interface IDocWrapperProps {
    // document: { author_id?: string };
    pageUser: User;
    userPermissions: DocUserPermissions,
    //   readonly: boolean,
    docTenantId: string;
    children: React.ReactNode;
}
// export const checkReadonly = (userPermissions: DocUserPermissions, document: { author_id?: string }, pageUserId?: string): boolean => {
//     return userPermissions.full_access ? false
//         : userPermissions.editor ? false
//             : (userPermissions.author && document.author_id === pageUserId) ? false
//                 : userPermissions.reader ? true
//                     : true
// }
export default function DocWrapper(props: IDocWrapperProps) {
    const docTenantId = useDocumentStore.getState().documentTenantId;
    // const isDocumentChanged = useIsDocumentChanged();
    const msgBox = useMessageBox();
    //#region sessionUser
    useEffect(() => {
        const initializeStoreUser = () => {
            if (!useDocumentStore.getState().sessionUser.id) {
                useDocumentStore.getState().setSessionUser(props.pageUser);
            }
        };
        initializeStoreUser();
    }, [props.pageUser]);
    //#endregion

    //#region tenant_id and tags  
    useEffect(() => {
        const fetchAndSetTags = async () => {
            try {
                const tags = await fetchAllTags(props.docTenantId);
                useDocumentStore.getState().setAllTags(tags);
            } catch (error) {
                console.error('Failed to fetch all tags: ', error);
            }
        };
        if (props.docTenantId) {
            useDocumentStore.getState().setDocumentTenantId(props.docTenantId);
            fetchAndSetTags();
        }
    }, [props.docTenantId]);

    useEffect(() => {
        const fetchAndSetTags = async () => {
            try {
                const tags = await fetchAllTags(docTenantId);
                useDocumentStore.getState().setAllTags(tags);
            } catch (error) {
                console.error('Failed to fetch all tags: ', error);
            }
        };
        if (docTenantId) fetchAndSetTags();
    }, [docTenantId]);
    //#endregion

    //#region msgBox
    useEffect(() => {
        return () => {
            // Сброс при уходе со страницы
            setIsDocumentChanged(false);
            setIsMessageBoxOpen(false);
            setIsOKButtonPressed(false);
            setIsCancelButtonPressed(false);
            setIsShowMessageBoxCancel(true);
            setMessageBoxText('');
        };
    }, []);

    useEffect(() => {
        if (msgBox.isOKButtonPressed && msgBox.messageBoxText === 'Документ изменен. Закрыть без сохранения?') {
            // router.push('/erp/premises/');
            window.history.back();
        }
        setIsOKButtonPressed(false);
        setIsCancelButtonPressed(false);
        setIsDocumentChanged(false);
        setIsMessageBoxOpen(false);
        setIsShowMessageBoxCancel(true);
    }, [msgBox.isOKButtonPressed]);
    //#endregion

    return <>
        {/* {JSON.stringify(props.docTenantId)} */}
        {props.children}
    </>;
}

