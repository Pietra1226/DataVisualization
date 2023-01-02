let metric ='company';
let metric2='totalyearlycompensation'
let metric_data
let visited = 1
let visited2 = 1
let visited3 = 1
//==================================Data Tools=================================================================================================
const parseI = string => (string == 'intel corporation' ? "Intel corporation" : string);
const parseNA = string => (string == 'NA' ? undefined : string); //Replace empty strings with NA
const parseDate = string => d3.timeParse('%m/%d/%Y %H:%M:%S')(string); //Reset time strings
const parseBool = string => (string == '1' ? true : false); // Replace number 0/1 with false/true respectively
// const parseRace = (string1,string2,string3) => (string1 == "1" ? string2 == "1" ? string3 == "1" ? "Asian" : "White" : "Black": "Na");
function parseRace(string1,string2,string3,string4){
    if(string1 == "1"){
        return "Asian"
    }
    else if (string2 == "1"){
        return "White"
    }
    else if (string3 == "1"){
        return "Black"
    }
    else if (string4 == "1"){
        return "Hispanic"
    }
    else{
        return "Na"
    }
}
function type(d){
    const date = parseDate(d.timestamp); // set time
    return{
        Barchelors_Degree:parseBool(d.Barchelors_Degree),
        Doctorate_Degree:parseBool(d.Doctorate_Degree),
        Education:parseNA(d.Education),
        Highschool:parseBool(d.Highschool),
        Masters_Degree:parseBool(d.Masters_Degree),
        Race:parseRace(d.Race_Asian,d.Race_White,d.Race_Black,d.Race_Hispanic),
        // Race_Asian:parseBool(d.Race_Asian),
        // Race_Black:parseBool(d.Race_Black),
        // Race_Hispanic:parseBool(d.Race_Hispanic),
        Some_College:parseBool(d.Some_College),
        basesalary:+d.basesalary,
        bonus:+d.bonus,
        cityid:parseNA(d.cityid),
        company:parseI(d.company),
        dmaid:parseNA(d.dmaid),
        gender:parseNA(d.gender),
        level:parseNA(d.level),
        location:parseNA(d.location),
        otherdetails:parseNA(d.otherdetails),
        rowNumber:+d.rowNumber,
        stockgrantvalue:+d.stockgrantvalue,
        tag:parseNA(d.tag),
        timestamp:date,
        timestamp_year:date.getFullYear(),
        title:parseNA(d.title),
        totalyearlycompensation:+d.totalyearlycompensation,
        yearsatcompany:+d.yearsatcompany,
        yearsofexperience:+d.yearsofexperience
    }
}

function formatTicks(d){
    return d3.format('~s')(d).replace('M','mil').replace('G','bil').replace('T','tri')
}

function filterData(data){
    return data.filter(
        d=> {
            return(
                d.basesalary>0 &&
                d.totalyearlycompensation>0 &&
                d.yearsatcompany>0 && d.yearsofexperience>0 &&
                d.Race!="Na" && d.company != 'Anonymous'
            );
        }
    );
}

function filterData2(data){
    return data.filter(
        d=> {
            return(
                d.basesalary>0 &&
                d.totalyearlycompensation>0 &&
                d.yearsatcompany>0 && d.yearsofexperience>0 &&
                d.company != 'Anonymous'
            );
        }
    );
}

function filterData3(data){
    return data.filter(
        d=> {
            return(
                d.basesalary>0 &&
                d.totalyearlycompensation>0 &&
                d.yearsatcompany>0 && d.yearsofexperience>0 &&
                d.company != 'Anonymous' && d.title == 'Hardware Engineer'
            );
        }
    );
}

//====================================================Ready to Draw=======================================================================
function ready(files){
    
    const dataClean=filterData(files);
    const dataClean2=filterData2(files);
    const dataClean3=filterData3(files);
    //Get Top 15 revenue files
    const revenueData=chooseData("company",dataClean);
    // const lineChartData = prepareLineChartData(dataClean);
    setupCanvas(revenueData, dataClean, dataClean2, dataClean3);
    // setupCanvas_line(lineChartData);
}

//====================================================Prepare Diagram Data================================================================
//Prepare bar chart
function chooseData(metric, dataClean){     
    const dataMap = d3.rollup(
        
        dataClean,
        v => d3.mean(v, leaf => leaf[metric2]),
        d => d[metric],
        
    );
    const dataMap_bonus = d3.rollup(
        
        dataClean,
        v => d3.mean(v, leaf => leaf.bonus),
        d => d[metric],
        
    );
    const dataMap_basesalary= d3.rollup(
        
        dataClean,
        v => d3.mean(v, leaf => leaf.basesalary),
        d => d[metric],
        
    );
    const dataMap_stockgrantvalue= d3.rollup(
        
        dataClean,
        v => d3.mean(v, leaf => leaf.stockgrantvalue),
        d => d[metric],
        
    );
    
    let dataArray = Array.from(dataMap, d=>({metric:d[0], metric2:d[1]}));
    let dataArray2 = Array.from(dataMap_bonus, d=>({metric:d[0],metric2:d[1]}));
    let dataArray3 = Array.from(dataMap_basesalary, d=>({metric:d[0],metric2:d[1]}));
    let dataArray4 = Array.from(dataMap_stockgrantvalue, d=>({metric:d[0],metric2:d[1]}));
    let dataArrayout =  [].concat(dataArray,dataArray2,dataArray3,dataArray4)

    let dataArraytemp = Array.from(d3.group(dataArrayout, d => d.metric), ([metric, metric2]) => ({metric, metric2}))
    let dataArraymerge = Array.from(dataArraytemp, d=>({metric:d.metric,metric2:d.metric2[0].metric2, metric3:d.metric2[1].metric2, metric4:d.metric2[2].metric2, metric5:d.metric2[3].metric2}))
    
    let thisData=dataArraymerge.sort(
        (a,b)=>{
            return d3.ascending(b.metric2, a.metric2);
        }
    ).filter((d,i)=>i<15);
    
    return thisData;
}

//Prepare line chart(Salary composition trend chart over the years)
function prepareLineChartData(data){
    //console.log(data);
    const groupByYear = d => d.timestamp_year;
    //console.log(groupByYear);
    const sumOfSalary = values => d3.mean(values, d=>d.totalyearlycompensation);
    const sumOfSalaryByYear = d3.rollup(data, sumOfSalary, groupByYear);
    //console.log(sumOfSalaryByYear)

    const sumOfStock = values => d3.mean(values, d=>d.stockgrantvalue);
    const sumOfStockByYear = d3.rollup(data,sumOfStock, groupByYear);

    const sumOfBase = values => d3.mean(values, d=>d.basesalary);
    const sumOfBaseByYear = d3.rollup(data,sumOfBase, groupByYear);

    const sumOfBonus = values => d3.mean(values, d=>d.bonus);
    const sumOfBonusByYear = d3.rollup(data,sumOfBonus, groupByYear);

    const salaryArray = Array.from(sumOfSalaryByYear).sort((a,b)=>a[0]-b[0]);
    const stockArray = Array.from(sumOfStockByYear).sort((a,b)=>a[0]-b[0]);
    const baseArray = Array.from(sumOfBaseByYear).sort((a,b)=>a[0]-b[0]);
    const bonusArray = Array.from(sumOfBonusByYear).sort((a,b)=>a[0]-b[0]);

    const parseYear = d3.timeParse('%Y');
    const dates = salaryArray.map(d=>parseYear(d[0]));
    const finalArray = salaryArray.map(d=>d[1]).concat(stockArray.map(d=>d[1]));
    const yMax = d3.max(finalArray);

    const lineData={
        series:[
            {
                name:'Total Salary',
                color:'dodgerblue',
                values:salaryArray.map(d=>({date:parseYear(d[0]),value:d[1]}))
            },
            {
                name:'Stock',
                color:'darkorange',
                values:stockArray.map(d=>({date:parseYear(d[0]),value:d[1]}))
            },
            {
                name:'Base Salary',
                color:'Orchid',
                values:baseArray.map(d=>({date:parseYear(d[0]),value:d[1]}))
            },
            {
                name:'Bonus',
                color:'LimeGreen',
                values:bonusArray.map(d=>({date:parseYear(d[0]),value:d[1]}))
            }
        ],
        dates:dates,
        yMax:yMax
    }
    return lineData;
}

//Prepare line chart(total salary and years at company)
function prepareLineChartData2(data){
    const groupByYear = d => d.yearsatcompany;
    //console.log(groupByYear);
    const sumOfSalary = values => d3.mean(values, d=>d.totalyearlycompensation);
    const sumOfSalaryByYear = d3.rollup(data, sumOfSalary, groupByYear);
    //console.log(sumOfSalaryByYear)

    //const sumOfStock = values => d3.mean(values, d=>d.stockgrantvalue);
    //const sumOfStockByYear = d3.rollup(data,sumOfStock, groupByYear);

    const salaryArray = Array.from(sumOfSalaryByYear).sort((a,b)=>a[0]-b[0]);
    //const stockArray = Array.from(sumOfStockByYear).sort((a,b)=>a[0]-b[0]);
    console.log(salaryArray)
    //const parseYear = d3.timeParse('%Y');
    const years = salaryArray.map(d=>(d[0]));
    const salaryfinalArray = salaryArray.map(d=>d[1]);
    //console.log(salaryandstockArray)
    const yMax = d3.max(salaryfinalArray);

    const lineData={
        series:[
            {
                name:'Hardware Engineer',
                color:'yellowgreen',
                values:salaryArray.map(d=>({year:(d[0]),value:d[1]}))
            }
        ],
        year:years,
        yMax:yMax
    }
    return lineData;
}

//Prepare Scatter chart
function prepareScatterData(data){
    return data.sort((a,b)=>b.bonus-a.bonus).filter((d,i)=>i<500);

}

//===================================================SetupCanvas Different Diagram=========================================================
//SetupCanvas for Bar chart
function setupCanvas(barChartData, dataClean, dataClean2, dataClean3){
    //一開始預設指標是revenue
    
    function click(){    
        if(this.dataset.name == 'company' || this.dataset.name == "title" || this.dataset.name == "Race" || this.dataset.name == "location"  ){
            if (metric == this.dataset.name){
                alert("已選擇"+this.dataset.name);
            }
            else{
                metric = this.dataset.name;
                const thisData=chooseData(metric, dataClean);
                update(thisData);
            }
        }
        else if (this.dataset.name == 'linechart1'  ){
            if (visited==0){
                alert("不要一直點拉");
            }
            else{
                visited=0
                const lineChartData = prepareLineChartData(dataClean2);
                console.log(lineChartData);
                setupCanvas_line(lineChartData);
            }
            
        }
        else if (this.dataset.name == 'linechart2' ){
            if (visited2==0){
                alert("不要一直點拉");
            }
            else{
                visited2=0
                const lineChartData = prepareLineChartData2(dataClean3);
                setupCanvas_line2(lineChartData);
            }
           
        }
        else if (this.dataset.name == 'scatterchart' ){
            if (visited3==0){
                alert("不要一直點拉");
            }
            else{
                visited3=0
                const scatterData = prepareScatterData(dataClean2);
                // console.log(scatterData);
                setupCanvas_scatter(scatterData);
            }
           
        }
        else{
            if (metric2 == this.dataset.name){
                alert("已選擇");
            }
            else{
                metric2 = this.dataset.name;
                const thisData=chooseData(metric, dataClean);
                update(thisData);
            }
        }
        
    }
    
    d3.selectAll('button').on('click',click);

    function update(data){
        //Update Scale
        xMax=d3.max(data, d=>d.metric2);
        xScale_v3 =d3.scaleLinear([0, xMax],[0,barchart_width]);
        yScale=d3.scaleBand().domain(data.map(d=>d.metric))
                 .rangeRound([0, barchart_height])
                 .paddingInner(0.25);

        //Transition Settings
        const defaultDelay=1000//ms
        const transitionDelay=d3.transition().duration(defaultDelay);

        //Update axis
        xAxisDraw.transition(transitionDelay).call(xAxis.scale(xScale_v3));
        yAxisDraw.transition(transitionDelay).call(yAxis.scale(yScale));

        //Update Header
        if (metric2=="yearsatcompany"){
            header.select('tspan').text(`Job tenure in different ${metric}`);
        }
        else{
            header.select('tspan').text(`Total yearly compensation in different ${metric}`);
        }
        
        bars.selectAll('.bar').data(data, d=>d.metric2).join(
            enter=>{
                enter.append('rect').attr('class','bar')
                     .attr('x',0)
                     .attr('y',d=>yScale(d.metric))
                     
                     .attr('height',yScale.bandwidth())
                     .style('fill','lightcyan')
                     .transition(transitionDelay)
                     .delay((d,i)=>i*20)
                     .attr('width',d=>xScale_v3(d.metric2))
                     .style('fill', 'yellowgreen')
                },
                update=>{
                    update.transition(transitionDelay)
                          .delay((d,i)=>i*20)
                          .attr('y',d=>yScale(d.metric))
                          .attr('width',d=>xScale_v3(d.metric2))
                    },
                exit=>{
                    exit.transition().duration(defaultDelay/2)
                        .style('fill-opacity',0)
                        .remove()
                }
        );
        d3.selectAll('.bar')
          .on('mouseover',mouseover)
          .on('mousemove',mousemove)
          .on('mouseout',mouseout);

    }
   
    const svg_width=900;
    const svg_height=500;
    const barchart_margin={top:80,right:80,bottom:40,left:170};
    const barchart_width=svg_width-(barchart_margin.left+barchart_margin.right);
    const barchart_height=svg_height-(barchart_margin.top+barchart_margin.bottom);
    const this_svg=d3.select('.bar-chart-container').append('svg')
                    .attr('width', svg_width).attr('height',svg_height)
                    .append('g')
                    .attr('transform',`translate(${barchart_margin.left},${barchart_margin.top})`);
    //V1.d3.extent find the max & min in revenue
    const xExtent=d3.extent(barChartData, d=>d.metric2);
    const xScale_v1 =d3.scaleLinear().domain(xExtent).range([0,barchart_width]);
    //V2.0 ~ max
    let xMax=d3.max(barChartData, d=>d.metric2);
    const xScale_v2 =d3.scaleLinear().domain([0, xMax]).range([0,barchart_width]);
    //V3.Short writing for v2
    let xScale_v3 =d3.scaleLinear([0,xMax],[0, barchart_width]);
    //垂直空間的分配-平均分布給Top 15
    let yScale=d3.scaleBand()
                 .domain(barChartData.map(d=>d.metric))
                 .rangeRound([0, barchart_height])
                 .paddingInner(0.25);

    const bars =this_svg.append('g').attr('class','bars');

    let header =this_svg.append('g').attr('class','bar-header')
                        .attr('transform',`translate(0,${-barchart_margin.top/2})`)
                        .append('text');
                        //header.append('tspan').text('Total revenue by genre in $US');
                        
    header.append('tspan').text('Top 15 XXX files');
    header.append('tspan').text('Years:2017-2021').attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555');
    let xAxis=d3.axisTop(xScale_v3).ticks(5).tickFormat(formatTicks).tickSizeInner(-barchart_height).tickSizeOuter(0);
    //this_svg.append('g').attr('class','xaxis').call(xAxis);
    let xAxisDraw=this_svg.append('g').attr('class','xaxis');
    //tickSize: set tickSizeInner& Outer
    let yAxis=d3.axisLeft(yScale).tickSize(0);
    //const yAxisDraw= this_svg.append('g').attr('class','yaxis').call(yAxis);
    let yAxisDraw=this_svg.append('g').attr('class','yaxis');
    yAxisDraw.selectAll('text').attr('dx','-0.6em');
    update(barChartData);

    //interactive 互動處理
    const tip = d3.select('.tooltip');

    function mouseover(e){
        //get data
        const thisBarData = d3.select(this).data()[0];
        const bodyData = [
            ['Base Salary', formatTicks(thisBarData.metric4)],
            ['Stock',formatTicks(thisBarData.metric5)],
            ['Bonus',formatTicks(thisBarData.metric3)]
        ];

        tip.style('left',(e.clientX+15)+'px')
           .style('top',e.clientY+'px')
           .transition()
           .style('opacity',0.98);
        
        tip.select('h3').html(`${thisBarData.title}, ${thisBarData.release_year}`);
        tip.select('h4').html(`${thisBarData.tagline}, ${thisBarData.runtime}min.`);

        d3.select('.tip-body').selectAll('p').data(bodyData)
          .join('p').attr('class','tip-info')
          .html(d=>`${d[0]} : ${d[1]}`);
    }

    function mousemove(e){
        tip.style('left',(e.clientX+15)+'px')
           .style('top',e.clientY+'px');
    }

    function mouseout(e){
        tip.transition()
           .style('opacity',0);
    }

    //interactive 新增監聽
    d3.selectAll('.bar')
      .on('mouseover',mouseover)
      .on('mousemove',mousemove)
      .on('mouseout',mouseout);
}

//SetupCanvas for Line chart(Salary composition trend chart over the years)
function setupCanvas_line(lineChartData){
    const svg_width=500;
    const svg_height=500;
    const linechart_margin={top:80,right:80,bottom:40,left:40};
    const linechart_width=svg_width-(linechart_margin.left+linechart_margin.right);
    const linechart_height=svg_height-(linechart_margin.top+linechart_margin.bottom);
    const this_svg=d3.select('.line-chart-container').append('svg')
                    .attr('width', svg_width).attr('height',svg_height)
                    .append('g')
                    .attr('transform',`translate(${linechart_margin.left},${linechart_margin.top})`);

    const xExtent = d3.extent(lineChartData.dates);
    const xScale = d3.scaleTime().domain(xExtent).range([0, linechart_width]);
    const yScale = d3.scaleLinear().domain([0,lineChartData.yMax]).range([linechart_height,0]);
    const lineGen = d3.line().x(d=>xScale(d.date)).y(d=>yScale(d.value));
    const chartGroup = this_svg.append('g').attr('class','line-chart');
    chartGroup.selectAll('.line-series').data(lineChartData.series).enter()
              .append('path')
              .attr('class',d=>`line-series ${d.name.toLowerCase()}`)
              .attr('d',d=>lineGen(d.values))
              .style('fill', 'none').style('stroke', d=>d.color);
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0).ticks(5);
    this_svg.append('g').attr('class','x axis')
                        .attr('transform',`translate(0,${linechart_height})`)
                        .call(xAxis);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(formatTicks)
                    .tickSizeInner(-linechart_width).tickSizeOuter(0);
    this_svg.append('g').attr('class', 'y axis').call(yAxis);

    chartGroup.append('g').attr('class','series-labels')
              .selectAll('.series-label').data(lineChartData.series).enter()
              .append('text')
              .attr('x',d=>xScale(d.values[d.values.length-1].date)+5)
              .attr('y',d=>yScale(d.values[d.values.length-1].value))
              .text(d=>d.name)
              .style('dominant-baseline','central')
              .style('font-size','0.7em').style('font-weight','bold')
              .style('fill',d=>d.color);

    const header_Line =this_svg.append('g').attr('class','bar-header')
            .attr('transform',`translate(0,${-linechart_margin.top/2})`)
            .append('text');
            //header.append('tspan').text('Total revenue by genre in $US');
                        
    header_Line.append('tspan').text('Salary composition trend chart over the years');
    header_Line.append('tspan').text('Years:2017-2021').attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555');
}

//SetupCanvas for Line chart(total salary and years at company)
function setupCanvas_line2(lineChartData){
    console.log(lineChartData);
    const svg_width=500;
    const svg_height=500;
    const linechart_margin={top:80,right:40,bottom:40,left:40};
    const linechart_width=svg_width-(linechart_margin.left+linechart_margin.right);
    const linechart_height=svg_height-(linechart_margin.top+linechart_margin.bottom);
    const this_svg=d3.select('.line-chart-container').append('svg')
                    .attr('width', svg_width).attr('height',svg_height)
                    .append('g')
                    .attr('transform',`translate(${linechart_margin.left},${linechart_margin.top})`);

    const xExtent = d3.extent(lineChartData.year);
    const xScale = d3.scaleLinear().domain(xExtent).range([0, linechart_width]);
    const yScale = d3.scaleLinear().domain([0,lineChartData.yMax]).range([linechart_height,0]);
    const lineGen = d3.line().x(d=>xScale(d.year)).y(d=>yScale(d.value));
    const chartGroup = this_svg.append('g').attr('class','line-chart');
    chartGroup.selectAll('.line-series').data(lineChartData.series).enter()
              .append('path')
              .attr('class',d=>`line-series ${d.name.toLowerCase()}`)
              .attr('d',d=>lineGen(d.values))
              .style('fill', 'none').style('stroke', d=>d.color);
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    this_svg.append('g').attr('class','x axis')
                        .attr('transform',`translate(0,${linechart_height})`)
                        .call(xAxis);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(formatTicks)
                    .tickSizeInner(-linechart_width).tickSizeOuter(0);
    this_svg.append('g').attr('class', 'y axis').call(yAxis);

    const header_Line =this_svg.append('g').attr('class','bar-header')
            .attr('transform',`translate(0,${-linechart_margin.top/2})`)
            .append('text');
    header_Line.append('tspan').text('Hardware Engineer Job Tenure and Salary Correlation');
    header_Line.append('tspan').text('Years:2017-2021').attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555');

}

//SetupCanvas for Scatter chart
function setupCanvas_scatter(scatterData){
    //console.log(scatterData)
    const svg_width=500;
    const svg_height=500;
    const chart_margin={top:80,right:80,bottom:40,left:80};
    const chart_width=svg_width-(chart_margin.left+chart_margin.right);
    const chart_height=svg_height-(chart_margin.top+chart_margin.bottom);
    const this_svg=d3.select('.scatter-plot-container').append('svg')
                    .attr('width', svg_width).attr('height',svg_height)
                    .append('g')
                    .attr('transform',`translate(${chart_margin.left},${chart_margin.top})`);

    const xExtent = d3.extent(scatterData, d=>d.bonus);
    const xScale = d3.scaleLinear().domain(xExtent).range([0, chart_width]);
    const yExtent = d3.extent(scatterData, d=>d.stockgrantvalue);
    const yScale = d3.scaleLinear().domain(yExtent).range([chart_height,0]);

    this_svg.selectAll('.scatter').data(scatterData).enter()
              .append('circle')
              .attr('class','scatter')
              .attr('cx', d=>xScale(d.bonus))
              .attr('cy', d=>yScale(d.stockgrantvalue))
              .attr('r',3)
              .style('fill','yellowgreen')
              .style('fill-opavity', 0.5);

    

    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(formatTicks)
                    .tickSizeInner(-chart_height).tickSizeOuter(0);
    const xAxisDraw = this_svg.append('g').attr('class','x axis')
                              .attr('transform',`translate(-10,${chart_height+0.1})`)
                              .call(xAxis)
                              .call(addLabel,'Bonus',25,0);
                              
    xAxisDraw.selectAll('text').attr('dy','2em');
    
    
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(formatTicks)
                    .tickSizeInner(-chart_height).tickSizeOuter(0);
    const yAxisDraw = this_svg.append('g').attr('class','y axis')
                              .attr('transform',`translate(-10,0)`)
                              .call(yAxis)
                              .call(addLabel,'Stock',-30,-30);
                              
    yAxisDraw.selectAll('text').attr('dx','-2em');

    const header_Line =this_svg.append('g').attr('class','bar-header')
            .attr('transform',`translate(0,${-chart_margin.top/2})`)
            .append('text');
            //header.append('tspan').text('Total revenue by genre in $US');
                        
    header_Line.append('tspan').text('Bonus vs. Stock in $US');
    header_Line.append('tspan').text('Years:2017-2021')
               .attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555');

    function brushed(e){
        if(e.selection){
            const[[x0,y0],[x1,y1]] = e.selection;
            const selected = scatterData.filter(
                d =>
                    x0 <= xScale(d.bonus) && xScale(d.bonus)<x1 &&
                    y0 <= yScale(d.stockgrantvalue) && yScale(d.stockgrantvalue) < y1
            );
            //console.log(selected);
            updateSelected(selected);
            highlightSelected(selected);
        }else{
            d3.select('.selected-body').html('');
            highlightSelected([]);
        }
    }

    //Add brush
    const brush = d3.brush().extent([[-10,0],[svg_width,svg_height]]).on('brush end',brushed);
    this_svg.append('g').attr('class','brush').call(brush);
    d3.select('.selected-container').style('width',`${svg_width}px`)
      .style('height',`${svg_height}px`);


}

//===================================================Scatter chart function================================================================
function addLabel(axis, label, x, y){
    /* axis 是呼叫者-哪一個軸*/
    axis.selectAll('.tick:last-of-type text')
    .clone().text(label).attr('x',x).attr('y',y)
    .style('text-anchor','start').style('font-weight','bold')
    .style('fill','#555');
}

let selectedId;

function mouseoverListItem(){
    selectedId = d3.select(this).data()[0].id;
    d3.selectAll('.scatter')
      .filter(d=>d.id === selectedId)
      .transition().attr('r',6).style('fill','coral');
}

function mouseoutListItem(){
    selectedId = d3.select(this).data()[0].id;
    d3.selectAll('.scatter')
      .filter(d=>d.id === selectedId)
      .transition().attr('r',3).style('fill','green');
}

function highlightSelected(data){
    const selectedIDs = data.map(d=>d.id);
    d3.selectAll('.scatter').filter(d=>selectedIDs.includes(d.id))
      .style('fill','green');

    d3.selectAll('.scatter').filter(d=>!selectedIDs.includes(d.id))
      .style('fill','dodgerblue');
}

function updateSelected(data){
    d3.select('.selected-body').selectAll('.selected-element')
      .on('mouseover',mouseoverListItem)
      .on('mouseout',mouseoutListItem)
      .data(data, d=>d.id).join(
        enter => {
            enter.append('p').attr('class','selected-element')
                 .html(
                    d=> `<span class="selected-title">${d.title}</span>,
                    ${d.timestamp_year}
                    <br>Bonus: ${formatTicks(d.bonus)} | 
                    Stock: ${formatTicks(d.stockgrantvalue)}`
                );
        },
        update => {
            update
        },
        exit => {
            exit.remove();
        }
      )
}

//==========================Get Data===============================
d3.csv('data.csv',type).then(
    res=>{
        ready(res);
    }
);