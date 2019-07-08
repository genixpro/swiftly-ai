import React from 'react'
import renderDocument from "./render_doc";
import ComparableSalesTable from "./comparable_sales_table";

class App extends React.Component {
  render()
  {
      return (
          <html>
            <body style={{"width": "7in"}}>
                <br/>
                <h1>Comparable Sales</h1>
                <br/>
                <br/>
                <ComparableSalesTable
                    comparableSales={this.props.comparableSales}
                />
            </body>
          </html>
    )
  }
}

renderDocument((data) =>
{
    return <App
        appraisal={data.appraisal}
        comparableSales={data.comparableSales}
    />;
});