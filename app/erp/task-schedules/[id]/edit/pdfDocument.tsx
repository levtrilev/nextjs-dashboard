import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { TaskScheduleForm } from '@/app/lib/definitions';
// import { FormData } from "./editForm";
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
// Компонент PDF
const PdfDocument = (formData: TaskScheduleForm) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Название: {formData.name}</Text>
        <Text>Описание: {formData.description}</Text>
        <Text>Дата принятия плана: {formData.date?.toISOString().split('T')[0]}</Text>
        <Text>Дата начала действия: {formData.date_start?.toISOString().split('T')[0]}</Text>
        <Text>Дата окончания действия: {formData.date_end?.toISOString().split('T')[0]}</Text>
        <Text>Раздел: {formData.section_name}</Text>
        <Text>Помещение: {formData.premise_name}</Text>
        <Text>Владелец плана: {formData.schedule_owner_name}</Text>
      </View>
    </Page>
  </Document>
);

export default PdfDocument;