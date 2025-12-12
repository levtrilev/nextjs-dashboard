'use client';

import { DocUserPermissions, SectionForm, User } from "@/app/lib/definitions";
import { fetchAllTags } from "@/app/lib/tags/tags-actions";
import { setIsCancelButtonPressed, setIsDocumentChanged, setIsMessageBoxOpen, setIsOKButtonPressed, setIsShowMessageBoxCancel, setMessageBoxText, useDocumentStore, useIsDocumentChanged, useMessageBox } from "@/app/store/useDocumentStore";
import { useEffect } from "react";

interface IDocWrapperProps {
    // document: { author_id?: string };
    pageUser: User;
    userSections: SectionForm[];
    userPermissions: DocUserPermissions;
    docTenantId: string;
    children: React.ReactNode;
}

export default function DocWrapper(props: IDocWrapperProps) {
    const docTenantId = useDocumentStore.getState().documentTenantId;
    // const isDocumentChanged = useIsDocumentChanged();
    const msgBox = useMessageBox();
    //#region sessionUser & userSections
    useEffect(() => {
        const initializeStoreUser = () => {
            if (!useDocumentStore.getState().sessionUser.id) {
                useDocumentStore.getState().setSessionUser(props.pageUser);
            }
        };
        initializeStoreUser();
    }, [props.pageUser]);

    useEffect(() => {
        const initializeStoreUserSections = () => {
            if (props.userSections) {
                useDocumentStore.getState().setUserSections(props.userSections);
            }
        };
        initializeStoreUserSections();
    }, [props.userSections]);
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

