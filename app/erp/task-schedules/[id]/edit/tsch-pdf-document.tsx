import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { TaskScheduleForm } from '@/app/lib/definitions';

import { Font } from '@react-pdf/renderer';
Font.register({
  family: 'Arial',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
})

import { FormData } from "./tsch-edit-form";
  // Создаем стили для PDF
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      padding: 30,
      fontSize: 12,
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
    text: {
      fontFamily: 'Arial', // Используем стандартный шрифт
      fontSize: 12,
    },
  });
  const formData: TaskScheduleForm = {
    id: "",
    name: "",
    description: "",
    schedule_owner_id: "",
    date: new Date(), //formatDateForInput(new Date()),
    premise_id: "",
    date_start: new Date(),
    date_end: new Date(),
    section_id: "",
    username: "",
    date_created: new Date(), //formatDateForInput(new Date()),
    section_name: "",
    schedule_owner_name: "",
    premise_name: "",


  } as TaskScheduleForm;

    export default function PdfDocument ({ formData }: { formData: FormData }) {
 return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.text}>Название: {formData.name}</Text>
            <Text style={styles.text}>Описание: {formData.description}</Text>
            <Text style={styles.text}>Дата принятия плана: {formData.date?.toISOString().split('T')[0]}</Text>
            <Text style={styles.text}>Дата начала действия: {formData.date_start?.toISOString().split('T')[0]}</Text>
            <Text style={styles.text}>Дата окончания действия: {formData.date_end?.toISOString().split('T')[0]}</Text>
            <Text style={styles.text}>Раздел: {formData.section_name}</Text>
            <Text style={styles.text}>Помещение: {formData.premise_name}</Text>
            <Text style={styles.text}>Владелец плана: {formData.schedule_owner_name}</Text>
          </View>
        </Page>
      </Document>
    );    }