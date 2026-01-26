import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';
import { FormData } from './warehouse-edit-form';

Font.register({
  family: 'Arial',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});

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
    fontFamily: 'Arial',
    fontSize: 12,
  },
});

export default function WarehousePdfDocument({ formData }: { formData: FormData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.text}>Название склада: {formData.name}</Text>
          <Text style={styles.text}>Раздел: {formData.section_name}</Text>
        </View>
      </Page>
    </Document>
  );
}