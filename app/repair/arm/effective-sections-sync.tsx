// effective-sections-sync.tsx
'use client';

import { useEffect } from 'react';
import { useTabsStore } from './tabsStore';
import { saveUserSections } from './arm-actions';

export function EffectiveSectionsSync({
    userId,
    allowedSections,
    initialEffectiveSections,
}: {
    userId: string;
    allowedSections: string[];
    initialEffectiveSections: string[];
}) {
    const { effectiveSections, setEffectiveSections, setAllowedSections, setUserId } = useTabsStore();

    // Инициализация из сервера (SSR → клиент)
    useEffect(() => {
        setAllowedSections(allowedSections);
        if (effectiveSections.length === 0) {
            setEffectiveSections(initialEffectiveSections);
            // console.log("EffectiveSectionsSync setEffectiveSections", initialEffectiveSections);
        }
    }, [allowedSections, initialEffectiveSections, setEffectiveSections, setAllowedSections, effectiveSections]);

    // effective-sections-sync.tsx
    useEffect(() => {
        setUserId(userId); // вызовет сброс tabs: [], если userId изменился

        // После сброса — установка allowedSections и initialEffectiveSections
        // setAllowedSections(allowedSections);
        //   if (get().effectiveSections.length === 0) {
        //     setEffectiveSections(initialEffectiveSections);
        //   }
    }, [userId,  setUserId]);


    // Синхронизация с сервером при изменении
    useEffect(() => {
        if (effectiveSections.length > 0) {
            saveUserSections(userId, effectiveSections).catch(console.error);
        }
    }, [effectiveSections]);

    return null; // компонент не рендерит ничего
}