import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
// import { objectForm } from '@/app/lib/definitions';

import { Font } from '@react-pdf/renderer';
Font.register({
  family: 'Arial',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf  ',
})

import { FormData } from "./system-edit-form";
import { SystemForm } from '@/app/lib/definitions';
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
const formData: SystemForm = {
  id: "",
  name: "",
  username: "",

} as SystemForm;

export default function PdfDocument({ formData }: { formData: FormData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.text}>Название: {formData.name}</Text>
        </View>
      </Page>
    </Document>
  );
}