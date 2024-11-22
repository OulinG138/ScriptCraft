import React, { useState} from "react";
import { Editor} from '@monaco-editor/react';
import useAuth from "@/hooks/useAuth";
import API from "@/routes/API";
import toast from "react-hot-toast";
import _ from "lodash";
import { useRouter } from "next/router";


const languages = [
    "python",
    "javascript",
    "java",
    "c",
    "cpp",
    "shell",
    "rust",
    "lua",
    "ruby",
    "r"
]

export default function Coding() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false)

  const [editorToggle, setEditor] = useState(true)
  const [savingToggle, setSaving] = useState(false)

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [stdout, setStdout] = useState("");

  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")

  const [tags, setTags] = useState<string[]>([])
  const [selectTag, setCurrTag] = useState("")
  const [newTag, setNewTag] = useState("")

  const { auth } = useAuth();
  const router = useRouter();

  const execute = async () =>    {
    const reqBody = {content: code, language: language, input: input}
    setIsExecuting(true)
    let res = await API.code.execute(reqBody)
    setStdout(res.data.stdout.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''))
    console.log(res)
    if (res.status === 201) {
      toast.error("Execution Successful but Timed Out")
    }
    setIsExecuting(false)
  }

  const toggleSave = () =>  {
    setSaving(!savingToggle)
  }

  const triggerSave = async () =>   {
    if (savingToggle) {
      if (auth.user === undefined) {
        toast.error("Only Logged in Users can Save")
      } else if (title === "" || desc === "" || code === "") {
        toast.error("Fields not completed")
      } else  {
        setIsSaving(true)
        const reqBody = { title: title, explanation: desc, codeContent: code, language: language, tags: tags}
        const res = await API.code.template(reqBody, _.get(auth, "accessToken", ""),)
        setIsSaving(false)

        if (res.status === 200) {
          toast.success("Template Successfully Created")
          const encryptedId = window.btoa(res.data.template.id)
          router.push("/code-template?id=" + encryptedId)
        } else  {
          toast.error(res.data.message)
        }
        console.log(res)
      }
    } else   {
      setSaving(!savingToggle)
    }
  }

  const toggleEditor = () =>    {
    setEditor(!editorToggle)
  }

  const addTag = () =>  {
    var orig = tags
    var updatedTags = orig.concat([newTag])

    setTags(updatedTags)
    setNewTag("")
  }

  const deleteTag = () => {
    var newTags = tags.filter((word) => (!(word === selectTag)))

    setTags(newTags)
    setCurrTag(tags[0])
  }
  
  return (
    <div className="flex flex-col w-full h-screen bg-gray-50 text-gray-900">

      <div className="flex items-center p-4 bg-gray-100 border-b border-gray-300 shadow">
        {savingToggle && (
          <div className="flex flex-grow flex-col sm:flex-row sm:items-start sm:space-x-8 space-y-4 sm:space-y-0">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-row items-center sm:space-x-2 space-x-1">
                <h1 className="text-lg font-semibold">Title:</h1>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="resize-none w-[150px] sm:w-[200px] h-8 bg-gray-200 text-gray-900 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-row items-center sm:space-x-2 space-x-1">
                <h1 className="text-lg font-semibold">Description:</h1>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="resize-none w-[200px] sm:w-[300px] h-12 sm:h-16 bg-gray-200 text-gray-900 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:items-start items-start space-y-4">
              <div className="flex flex-row items-center sm:space-x-2 space-x-1">
                <h1 className="text-lg font-semibold">Tags:</h1>
                <select
                  onChange={(e) => setCurrTag(e.target.value)}
                  className="bg-gray-200 border border-gray-300 rounded px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-[150px] sm:w-[200px]"
                >
                  {tags.length === 0 && (
                    <option
                      key="== Add Tag =="
                      value="== Add Tag =="
                      className="bg-gray-200 text-gray-800"
                    >
                      == Add Tags ==
                    </option>
                  )}
                  {tags.map((tag) => (
                    <option
                      key={tag}
                      value={tag}
                      className="bg-gray-200 text-gray-800"
                    >
                      {tag}
                    </option>
                  ))}
                </select>
                <button
                  onClick={deleteTag}
                  disabled={tags.length === 0}
                  className="bg-slate-500 text-white px-2 py-1 rounded hover:bg-slate-600 text-sm sm:text-base"
                >
                  Delete Selected
                </button>
              </div>

              <div className="flex flex-row items-center sm:space-x-2 space-x-1">
                <textarea
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="resize-none w-[150px] sm:w-[200px] h-8 bg-gray-200 text-gray-900 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addTag}
                  disabled={newTag === ""}
                  className="bg-slate-500 text-white px-2 py-1 rounded hover:bg-slate-600 text-sm sm:text-base"
                >
                  Add Tag
                </button>
              </div>

            </div>
          </div>
        )}

        <div className="ml-auto flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          {savingToggle && (
            <button
              onClick={toggleSave}
              className="bg-slate-500 text-white px-3 py-2 rounded hover:bg-slate-600 text-sm sm:text-base"
            >
              Hide
            </button>
          )}
          <button
            onClick={triggerSave}
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm sm:text-base"
          >
            {savingToggle ? "Save" : "Create Code Template"}
          </button>
        </div>
      </div>

      {isSaving && (
            <div className="flex justify-center items-center p-2 bg-blue-500 space-x-2">
              <h1 className="text-white">Creating Code Template...</h1>
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            </div>
      )}

      <div className="flex flex-col sm:flex-row flex-grow overflow-hidden p-2 sm:p-4 space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex flex-col flex-grow bg-white shadow-lg rounded overflow-hidden w-full sm:w-4/5">
          <div className="flex flex-row items-center justify-between bg-gray-100 p-2 sm:p-3 border-b border-gray-300">
            <div className="flex items-center space-x-2">
              <span className="text-sm sm:text-lg font-semibold"> 
                {editorToggle ? "Code Editor" : "Input"}
              </span>
              <select
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-200 border border-gray-300 rounded px-2 py-1 sm:px-4 sm:py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-24 sm:w-auto"
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex space-x-2">
              <button
                onClick={toggleEditor}
                className="bg-purple-600 text-white px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-purple-700"
              >
                {editorToggle ? "Switch to Input" : "Switch to Code"}
              </button>
              <button
                onClick={execute}
                className="bg-green-500 text-white px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-green-600"
              >
                Execute
              </button>
            </div>
          </div>

          <div className="flex-grow">
            {editorToggle ? (
              <Editor
                value={code}
                onChange={(value) => setCode(value || "")}
                className="w-full h-full border-none focus:outline-none"
                language={language}
                theme="vs-dark"
              />
            ) : (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-full resize-none bg-gray-800 text-gray-200 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col bg-white shadow-lg rounded overflow-hidden w-full sm:w-1/5 sm:h-auto sm:self-stretch">
          <div className="bg-gray-100 p-2 sm:p-3 border-b border-gray-300">
            <span className="text-sm sm:text-lg font-semibold">stdout</span>
          </div>
          {isExecuting && (
            <div className="flex justify-center items-center p-2 bg-green-500 space-x-2">
              <h1 className="text-white">Executing...</h1>
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
          <textarea
            value={stdout}
            readOnly
            className="w-full h-60 sm:h-full resize-none bg-gray-800 text-gray-200 border-none focus:outline-none"
          />
        </div>
      </div>
    </div>
    );
}
