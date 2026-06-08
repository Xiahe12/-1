import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import StudyData from './pages/StudyData'
import StudyTasks from './pages/StudyTasks'
import CodePractice from './pages/CodePractice'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/practice/:chapterId" element={<CodePractice />} />
          <Route path="/study-data" element={<StudyData />} />
          <Route path="/study-tasks" element={<StudyTasks />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
