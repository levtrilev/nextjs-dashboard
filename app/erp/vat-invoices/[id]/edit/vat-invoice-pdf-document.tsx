// https://www.reddit.com/r/reactjs/comments/1qp1pqa/how_i_handled_pdf_generation_in_react_without/

// Если вам нужны чистые, легко выделяемые PDF-файлы с единообразной структурой, API, 
// подобный PDFBolt, — это простое решение. Он обрабатывает файлы с помощью Chromium 
// и преобразует их в PDF, а затем и возвращает настоящий PDF-файл.

// В итоге мы использовали Puppeter для рендеринга, чтобы добиться единообразного дизайна 
// во всех браузерах и того, что пользователи видят в предварительном просмотре нашего редактора 
// резюме на JobJump.

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
// import { Roboto } from 'next/font/google';
// import RobotoRegular from '@/public/fonts/Roboto-Regular.ttf';
// import RobotoBold from '@/public/fonts/Roboto-Bold.ttf';
// import { roboto } from '@/app/fonts';
import { FormData } from './vat-invoice-edit-form';
import { VatInvoiceGoodItem } from '../../lib/store/vatInvoiceGoodsStoreFactory';


Font.register({
  family: 'Arial',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
    fontFamily: 'Arial',    
    fontSize: 12,
    alignItems: 'flex-start', // Выравнивание по левому краю
    justifyContent: 'flex-start', // Выравнивание по верху
  },
  section: {
    margin: 10,
    marginLeft: 30,
    padding: 10,
    // Убираем flexGrow: 1, чтобы section не занимал всё пространство
  },
  text: {
    fontSize: 12,
  },
  tableContainer: {
    borderWidth: 0.5,
    borderColor: '#000',
    borderStyle: 'solid',
    marginTop: 10, // Добавляем отступ сверху для разделения
    marginLeft: 30,
    // padding: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#000',
    borderStyle: 'solid',
  },
  headerRow: {
    // backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCol_5: {
    width: '5%',
    borderRightWidth: 0.5,
    borderColor: '#000',
    borderStyle: 'solid',
    padding: 4,
    flexShrink: 0,           // Номер не должен сжиматься
  },
    tableCol_20: {
    width: '20%',
    borderRightWidth: 0.5,
    borderColor: '#000',
    borderStyle: 'solid',
    padding: 4,
    flexShrink: 1, 
  },
  tableCol_25: {
    width: '25%',
    borderRightWidth: 0.5,
    borderColor: '#000',
    borderStyle: 'solid',
    padding: 4,
    flexShrink: 1, 
  },
    tableCol_10: {
    width: '10%',
    borderRightWidth: 0.5,
    borderColor: '#000',
    borderStyle: 'solid',
    padding: 4,
    flexShrink: 1, 
  },
    tableCol_15: {
    width: '15%',
    borderRightWidth: 0.5,
    borderColor: '#000',
    borderStyle: 'solid',
    padding: 4,
    flexShrink: 1, 
  },
    tableCol_60: {
    width: '60%',
    borderRightWidth: 0.5,
    borderColor: '#000',
    borderStyle: 'solid',
    padding: 4,
    flexShrink: 1, 
  },
  tableCell_85: {
    fontSize: 10,
    textAlign: 'left',
    flexWrap: 'wrap',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    width: '85%',           // явно задаём ширину текста
    flexShrink: 1,
    lineHeight: 1.2,
  },
    tableCell_100: {
    fontSize: 10,
    textAlign: 'left',
    flexWrap: 'wrap',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    width: '100%',           // явно задаём ширину текста
    flexShrink: 1,
    lineHeight: 1.2,
  },
  lastCol: {
    borderRightWidth: 0, // убираем правую границу у последнего столбца
  },
  lastRow: {
    borderBottomWidth: 0, // убираем нижнюю границу у последней строки
  },
});


export default function VatInvoicePdfDocument({ formData, goods }
  : { formData: FormData; goods: VatInvoiceGoodItem[] }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.text}>Название: {formData.name}</Text>
          <Text style={styles.text}>Счет-Фактура N: {formData.number}</Text>
          <Text style={styles.text}>От: {formData.date}</Text>
          <Text style={styles.text}>Продавец: {formData.our_legal_entity_name}</Text>
          <Text style={styles.text}>Адрес: {formData.our_legal_entity_name}</Text>
          <Text style={styles.text}>ИНН/КПП продавца: {formData.our_legal_entity_name}</Text>
          <Text style={styles.text}>Покупатель: {formData.customer_name}</Text>
          <Text style={styles.text}>Адрес: {formData.customer_name}</Text>
          <Text style={styles.text}>ИНН/КПП покупателя: {formData.customer_name}</Text>
          <Text style={styles.text}>К платежно-расчетному документу N: {formData.description}</Text>
          <Text style={styles.text}>От: {formData.description}</Text>
        </View>

      <View style={styles.tableContainer}>
        {/* Header */}
        <View style={[styles.tableRow, styles.headerRow]}>
          <View style={styles.tableCol_5}>
            <Text style={styles.tableCell_100}>№ п/п</Text>
          </View>
          <View style={styles.tableCol_10}>
            <Text style={styles.tableCell_100}>Артикул</Text>
          </View>
          <View style={styles.tableCol_25}>
            <Text style={styles.tableCell_100}>{`Наименование товара ( описание выполненных работ/услуг )`}</Text>
          </View>
          <View style={styles.tableCol_5}>
            <Text style={styles.tableCell_100}>Ед. изм.</Text>
          </View>
          <View style={styles.tableCol_10}>
            <Text style={styles.tableCell_100}>Кол-во шт.</Text>
          </View>
          <View style={styles.tableCol_10}>
            <Text style={styles.tableCell_100}>Цена за ед.</Text>
          </View>
          <View style={styles.tableCol_10}>
            <Text style={styles.tableCell_100}>Скидка</Text>
          </View>
          <View style={[styles.tableCol_25, styles.lastCol]}>
            <Text style={styles.tableCell_100}>Сумма</Text>
          </View>
        </View>        

        {/* все товары */}
        {goods.map((good, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.tableCol_5}>
              <Text style={styles.tableCell_100}>{index + 1}</Text>
            </View>
            <View style={styles.tableCol_10}>
              <Text style={styles.tableCell_100}>{good.product_code}</Text>
            </View>
            <View style={styles.tableCol_25}>
              <Text style={styles.tableCell_100}>{good.good_name}</Text>
            </View>
            <View style={styles.tableCol_5}>
              <Text style={styles.tableCell_100}>{good.measure_unit}</Text>
            </View>
            <View style={styles.tableCol_10}>
              <Text style={styles.tableCell_100}>{good.quantity}</Text>
            </View>
            <View style={styles.tableCol_10}>
              <Text style={styles.tableCell_100}>{good.price}</Text>
            </View>
            <View style={styles.tableCol_10}>
              <Text style={styles.tableCell_100}>{good.discount+'%'}</Text>
            </View>
            <View style={[styles.tableCol_20, styles.lastCol]}>
              <Text style={styles.tableCell_100}>{good.amount}</Text>
            </View>
          </View>
        ))}

        {/* Row 2 - последняя строка */}
        {/* <View style={[styles.tableRow, styles.lastRow]}>
          <View style={styles.NumberTableCol}>
            <Text style={styles.tableCell}>Данные 5</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Данные 6</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Данные 7</Text>
          </View>
          <View style={[styles.tableCol, styles.lastCol]}>
            <Text style={styles.tableCell}>Данные 8</Text>
          </View>
        </View> */}

      </View>

      </Page>
    </Document>
  );
}

  // <Document>
  //   <Page size="A4" style={styles.page}>
  //     <View style={styles.tableContainer}>
  //       {/* Header */}
  //       <View style={[styles.tableRow, styles.headerRow]}>
  //         <View style={styles.tableCol}>
  //           <Text style={styles.tableCell}>Заголовок 1</Text>
  //         </View>
  //         <View style={styles.tableCol}>
  //           <Text style={styles.tableCell}>Заголовок 2</Text>
  //         </View>
  //         <View style={styles.tableCol}>
  //           <Text style={styles.tableCell}>Заголовок 3</Text>
  //         </View>
  //         <View style={[styles.tableCol, styles.lastCol]}>
  //           <Text style={styles.tableCell}>Заголовок 4</Text>
  //         </View>
  //       </View>
        
  //       {/* Row 1 */}
  //       <View style={styles.tableRow}>
  //         <View style={styles.tableCol}>
  //           <Text style={styles.tableCell}>Данные 1</Text>
  //         </View>
  //         <View style={styles.tableCol}>
  //           <Text style={styles.tableCell}>Данные 2</Text>
  //         </View>
  //         <View style={styles.tableCol}>
  //           <Text style={styles.tableCell}>Данные 3</Text>
  //         </View>
  //         <View style={[styles.tableCol, styles.lastCol]}>
  //           <Text style={styles.tableCell}>Данные 4</Text>
  //         </View>
  //       </View>
        
  //       {/* Row 2 - последняя строка */}
  //       <View style={[styles.tableRow, styles.lastRow]}>
  //         <View style={styles.tableCol}>
  //           <Text style={styles.tableCell}>Данные 5</Text>
  //         </View>
  //         <View style={styles.tableCol}>
  //           <Text style={styles.tableCell}>Данные 6</Text>
  //         </View>
  //         <View style={styles.tableCol}>
  //           <Text style={styles.tableCell}>Данные 7</Text>
  //         </View>
  //         <View style={[styles.tableCol, styles.lastCol]}>
  //           <Text style={styles.tableCell}>Данные 8</Text>
  //         </View>
  //       </View>
  //     </View>
  //   </Page>
  // </Document>