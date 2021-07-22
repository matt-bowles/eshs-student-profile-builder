import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ClassBreakdownPage, StudentBreakdownPage, HomePage, NotFoundPage, StudentProfilePage, TrendsPage } from './components';

import Typography from '@material-ui/core/Typography';

export default function App() {
  return (
    <>
      <Router>

        <Typography variant="h4" style={{ textAlign: "center" }}><b>ESHS Student Profile Builder</b></Typography>
        <Typography variant="h6" style={{ textAlign: "center", fontSize: "16px", marginBottom: "1%" }}>Matt Bowles, 2021</Typography>


        <Switch>
          <Route path="/" component={HomePage} exact />
          <Route path="/create" component={StudentProfilePage} />
          <Route path="/edit/:id" component={StudentProfilePage} />
          
          <Route path="/404" component={NotFoundPage} />

          <Route path="/trends/classes/:class" component={ClassBreakdownPage} />
          <Route path="/trends/students/:student" component={StudentBreakdownPage} />
          
          <Route path="/trends" component={TrendsPage} />

          <Redirect to="/404" component={NotFoundPage} />
        </Switch>
      </Router>
    </>
  );
}
