
import { useState, useEffect } from 'react'
import supabase from '../../config/supabaseClient'


function Page() {
  const [todos, setTodos] = useState([])

  useEffect(() => {
   async function getTodos() {
      const { data: todos } = await supabase.from('UserTable').select()

      if (todos.length > 0) {
        console.log(todos)
      }
    }

    getTodos()
  }, [])

  return (
    <div>
      {todos.map((todo) => (
        <li key={todo}>{todo}</li>
      ))}
    </div>
  )
}
export default Page
