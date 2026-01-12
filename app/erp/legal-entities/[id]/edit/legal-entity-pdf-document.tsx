import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { LegalEntityForm } from '@/app/lib/definitions';

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
    fontSize: 12,
  },
});

export default function LegalEntityPdfDocument({ formData }: { formData: LegalEntityForm }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.text}>Название: {formData.name}</Text>
          <Text style={styles.text}>Полное: {formData.fullname}</Text>
          <Text style={styles.text}>ИНН: {formData.inn}</Text>
          <Text style={styles.text}>Юр.адрес: {formData.address_legal}</Text>
          <Text style={styles.text}>Телефон: {formData.phone}</Text>
          <Text style={styles.text}>Email: {formData.email}</Text>
          <Text style={styles.text}>Контакт: {formData.contact}</Text>
          <Text style={styles.text}>Покупатель: {formData.is_customer ? 'Да' : 'Нет'}</Text>
          <Text style={styles.text}>Поставщик: {formData.is_supplier ? 'Да' : 'Нет'}</Text>
          <Text style={styles.text}>КПП: {formData.kpp}</Text>
        </View>
      </Page>
    </Document>
  );
}