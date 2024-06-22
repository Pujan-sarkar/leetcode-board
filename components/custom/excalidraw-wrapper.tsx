"use client"
import {
  Excalidraw,
  MainMenu,
  serializeAsJSON,
  WelcomeScreen,
} from "@excalidraw/excalidraw"
import Image from "next/image"
import * as React from "react"
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types"
import { AppState, BinaryFiles } from "@excalidraw/excalidraw/types/types"
import { getDocumentData, saveDocumentData } from "@/lib/firebase/crud"

interface ExcalidrawWrapperProps {
  problem_ID: string
}

const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = ({
  problem_ID,
}) => {
  const on_change = async (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles
  ) => {
    console.log("Function invoked")
    console.log(`excalidraw_${problem_ID}`)
    const content = serializeAsJSON(elements, appState, files, "local")

    try {
      await saveDocumentData("excalidraw", problem_ID, { content })
      console.log("Data saved to Firestore")
    } catch (error) {
      console.error("Error saving data to Firestore:", error)
    }
  }

  const retriveInitialData = async () => {
    try {
      const data = await getDocumentData("excalidraw", problem_ID)
      if (data && data.content) {
        return JSON.parse(data.content)
      }
    } catch (error) {
      console.error("Error retrieving data from Firestore:", error)
    }
    return null
  }

  const [initialData, setInitialData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await retriveInitialData()
      setInitialData(data)
      setLoading(false)
    }

    fetchData()
  }, [problem_ID])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ height: "90.5vh", width: "100%" }}>
      <Excalidraw onChange={on_change} initialData={retriveInitialData()}>
        <WelcomeScreen>
          <WelcomeScreen.Hints.MenuHint />
          <WelcomeScreen.Hints.ToolbarHint />
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Logo>
              <Image
                src="/center_logo.jpeg"
                alt="LC Board"
                width={200}
                height={200}
              />
            </WelcomeScreen.Center.Logo>
            <WelcomeScreen.Center.Heading>
              Notes, Made Simple!
            </WelcomeScreen.Center.Heading>
            <WelcomeScreen.Center.Menu>
              <WelcomeScreen.Center.MenuItemLoadScene />
              <WelcomeScreen.Center.MenuItemHelp />
            </WelcomeScreen.Center.Menu>
          </WelcomeScreen.Center>
          <WelcomeScreen.Hints.HelpHint />
        </WelcomeScreen>

        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.Help />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
      </Excalidraw>
    </div>
  )
}
export default ExcalidrawWrapper
