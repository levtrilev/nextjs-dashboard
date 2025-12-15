import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';

Font.register({
  family: 'Arial',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});

import { FormData } from './unit-edit-form';
import { UnitForm } from '@/app/lib/definitions';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', padding: 30, fontSize: 12 },
  section: { margin: 10, padding: 10, flexGrow: 1 },
  text: { fontFamily: 'Arial', fontSize: 12 },
});

export default function PdfDocument({ formData }: { formData: FormData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.text}>Участок: {formData.name}</Text>
          <Text style={styles.text}>Объект: {formData.object_name}</Text>
          <Text style={styles.text}>Раздел: {formData.section_name}</Text>
        </View>
      </Page>
    </Document>
  );
}