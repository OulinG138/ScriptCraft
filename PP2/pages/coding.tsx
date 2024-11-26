import React, { useEffect, useState} from "react";
import { Editor} from '@monaco-editor/react';
import useAuth from "@/hooks/useAuth";
import API from "@/routes/API";
import toast from "react-hot-toast";
import _ from "lodash";
import { useRouter } from "next/router";
import{
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";


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
  const [isIncomplete, setIncomplete] = useState(false)

  const [editorToggle, setEditor] = useState(true)
  const [savingToggle, setSaving] = useState(false)
  const [dialogueToggle, setDialogue] = useState(false)
  const [dialogErrorToggle, setDialogueError] = useState(false)

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [stdout, setStdout] = useState("");

  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")

  const [tags, setTags] = useState<string[]>([])
  const [tempTags, setTempTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const { auth } = useAuth();
  const router = useRouter();

  const execute = async () =>    {
    const reqBody = {content: code, language: language, input: input}
    setIsExecuting(true)
    let res = await API.code.execute(reqBody)
    var out = null
    if (res.status === 203) {
      out = res.data.error
    } else  {
      out = res.data.stdout
    }
    setStdout(out.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''))
    if (res.status === 201) {
      toast.error("Execution Successful but Timed Out")
    }
    setIsExecuting(false)
  }

  const toggleSave = () =>  {
    setSaving(!savingToggle)
  }

  const triggerSave = async (event: React.FormEvent<HTMLFormElement>) =>   {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    if (!data.get("title") || !data.get("desc"))  {
      setDialogueError(true)
      return;
    }

    setIsSaving(true)
    const reqBody = { title: data.get("title"), explanation: data.get("desc"), codeContent: code, language: language, tags: tags}
    const res = await API.code.template(reqBody, _.get(auth, "accessToken", ""),)
    setIsSaving(false)
  
    if (res.status === 200) {
      toast.success("Template Successfully Created")
      const encryptedId = window.btoa(res.data.template.id)
      router.push("/code-template?id=" + encryptedId)
    } else  {
      toast.error(res.data.message)
    } 
  }

  const toggleEditor = () =>    {
    setEditor(!editorToggle)
  }

  const toggleDialogue = () =>    {
    setTempTags(tags)
    setDialogue(!dialogueToggle);
  }

  const addTag = () =>  {
    var exists = tempTags.indexOf(newTag) > -1
    if (exists) {
      toast.error("Tag Already Added")
    } else  {
      var orig = tempTags;
      var updatedTags = orig.concat([newTag]);
  
      setNewTag("")
      setTempTags(updatedTags);
    }
  }

  const handleKey = (e: { key: string; }) =>  {
    if (e.key === "Enter") {
      addTag()
    }
  }

  const deleteTag = (tag: string)  =>  {
    var newTags = tempTags.filter((word) => (!(word === tag)));
    setTempTags(newTags);
  }

  const fillTemplate = async (id: number) =>    {
    const template = await API.code.getTemplate(id)
    if (template.status === 200)    {
        const data = template.data.result
        setCode(data.codeContent)
    }   else    {
        router.push("/coding")
    }
  }

  useEffect(() => {
    if (router.isReady) {
        const encryptedId = router.query.id 
        if (typeof(encryptedId) === "string")    {
            try {
                const id = window.atob(encryptedId)
                fillTemplate(parseInt(id))
            }   catch (error)   {
                router.push("/coding")
            }
        }   else    {
            router.push("/coding")
        }
        
    }
  }, [router.isReady]);
  
  return (
    <div className="flex flex-col w-full h-screen bg-gray-50 text-gray-900">

<div className="custom-ui">
        <Box
          component="form"
          noValidate
          onSubmit={triggerSave}
          className="space-y-4"
          maxWidth="lg"
        >
          <Dialog
            disablePortal
            open={dialogueToggle}
            onClose={toggleDialogue}
            aria-labelledby="customized-dialog-title"
            disableEscapeKeyDown
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle id="customized-dialog-title" onClose={toggleDialogue}>
              Edit Information:
            </DialogTitle>
            <DialogContent dividers>
              <Box mb={2}>
                <TextField
                  required
                  error={dialogErrorToggle}
                  id="outlined-required"
                  helperText={(dialogErrorToggle) ? "Please Fill Field." : ""}
                  name="title"
                  label="Title"
                  variant="filled"
                  fullWidth
                  defaultValue={title}
                />
              </Box>
              <Box mb={2}>
                <TextField
                  required
                  error={dialogErrorToggle}
                  id="standard-multiline-static"
                  helperText={(dialogErrorToggle) ? "Please Fill Field." : ""}
                  label="Description"
                  name="desc"
                  multiline
                  rows={4}
                  fullWidth
                  defaultValue={desc}
                />
              </Box>
              <Box mb={2} display="flex" alignItems="center" gap={2}>
                <TextField
                  id="outlined-controlled"
                  label="New Tag"
                  variant="outlined"
                  size="small"
                  value={newTag}
                  onChange={(e) => {setNewTag(e.target.value)}}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleKey(e);
                    }
                  }}
                  style={{ width: '60%' }}
                />
                <Button
                  variant="contained"
                  onClick={addTag}
                  className="bg-slate-500 disabled:bg-slate-300 text-white px-6 py-2 rounded hover:bg-slate-600 disabled:hover:bg-slate-300 text-sm lg:text-base"
                >
                  Add Tag
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap", 
                  gap: 1,          
                }}
              >
                {tempTags.map((tag) => (
                  <Chip
                    key={tag}
                    variant="outlined"
                    label={tag}
                    onDelete={() => deleteTag(tag)}
                  />
                ))}
              </Box>

            </DialogContent>
            <DialogActions>
              <Button autoFocus type="submit" color="primary">
                Finish
              </Button>
              <Button autoFocus onClick={toggleDialogue} color="primary">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </div>

      <div className="flex items-center p-4 bg-gray-100 border-b border-gray-300 shadow">
        {savingToggle && (
          <div className="flex flex-grow flex-col sm:flex-row sm:items-start sm:space-x-8 space-y-4 sm:space-y-0">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-row items-center sm:space-x-2 space-x-1">
                <h1 className="text-lg font-semibold">Title:</h1>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={isIncomplete && !title ? "resize-none w-[150px] sm:w-[200px] h-8 bg-gray-200 text-gray-900 border border-red-600 rounded p-2 focus:outline-none focus:ring-2 focus:ring-red-700" : 
                    "resize-none w-[150px] sm:w-[200px] h-8 bg-gray-200 text-gray-900 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  }
                  
                />
              </div>

              <div className="flex flex-row items-center sm:space-x-2 space-x-1">
                <h1 className="text-lg font-semibold">Description:</h1>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className={isIncomplete && !desc ? "resize-none w-[200px] sm:w-[300px] h-12 sm:h-16 bg-gray-200 text-gray-900 border border-red-600 rounded p-2 focus:outline-none focus:ring-2 focus:ring-red-700" : 
                    "resize-none w-[200px] sm:w-[300px] h-12 sm:h-16 bg-gray-200 text-gray-900 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  }
                />
              </div>
            </div>
          </div>
        )}

        <div className="ml-auto flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          <button
            onClick={toggleDialogue}
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm sm:text-base"
          >
            Create Code Template
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
