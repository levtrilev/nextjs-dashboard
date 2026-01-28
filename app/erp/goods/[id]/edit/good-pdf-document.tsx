import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';
import { FormData } from './good-edit-form';

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

export default function GoodPdfDocument({ formData }: { formData: FormData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.text}>Название: {formData.name}</Text>
          <Text style={styles.text}>Бренд: {formData.brand}</Text>
          <Text style={styles.text}>Артикул: {formData.product_code}</Text>
          <Text style={styles.text}>Поставщик: {formData.supplier_name}</Text>
          <Text style={styles.text}>Размеры (В×Ш×Д): {formData.dimensions_height} × {formData.dimensions_width} × {formData.dimensions_length} см</Text>
          <Text style={styles.text}>Вес: {formData.weight} кг</Text>
          <Text style={styles.text}>Цена розница: {formData.price_retail}</Text>
          <Text style={styles.text}>Цена опт: {formData.price_wholesale}</Text>
          <Text style={styles.text}>Цена закупки: {formData.price_cost}</Text>
        </View>
      </Page>
    </Document>
  );
}