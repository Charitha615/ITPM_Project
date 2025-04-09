import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import { Chart } from 'react-chartjs-2';
import logo from '../../assets/img/logo.jpg';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',  
    paddingBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333'
  },
  logo: {
    width: 100,
    height: 40
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444444'
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  tableRow: {
    flexDirection: 'row'
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#F5F5F5'
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 'bold'
  },
  tableCell: {
    margin: 5,
    fontSize: 10
  },
  chartContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    textAlign: 'center',
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10
  }
});

// Create Document Component
export const PDFDocument = ({ data, config, reportConfig }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{config.title}</Text>
        <Image style={styles.logo} src={logo} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report Details</Text>
        <Text>Date Range: {reportConfig.startDate.toLocaleDateString()} - {reportConfig.endDate.toLocaleDateString()}</Text>
        <Text>Report Type: {reportConfig.reportType}</Text>
      </View>

      {config.includeCharts && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Registrations</Text>
            <View style={styles.chartContainer}>
              {/* Chart would be rendered as an image here */}
              <Text>[User Registration Chart]</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Usage</Text>
            <View style={styles.chartContainer}>
              {/* Chart would be rendered as an image here */}
              <Text>[Category Usage Chart]</Text>
            </View>
          </View>
        </>
      )}

      {config.includeTables && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Data</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Date</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Users</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Categories</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Revenue</Text>
              </View>
            </View>
            {data.userRegistrations.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.date}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.count}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{data.categoryUsage[index]?.count || 0}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>${data.revenueData[index]?.amount || 0}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()} | Confidential</Text>
      </View>
    </Page>
  </Document>
);