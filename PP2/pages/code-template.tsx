import React, { useEffect, useState} from "react";
import { Editor} from '@monaco-editor/react';
import useAuth from "@/hooks/useAuth";
import API from "@/routes/API";
import toast from "react-hot-toast";
import _ from "lodash";
import { useRouter } from 'next/router';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import{
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";

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
  const [isOwner, setIsOwner] = useState(true)

  const [parentId, setParentId] = useState("")
  const [author, setAuthor] = useState("")
  const [created, setCreated] = useState("")
  const [updated, setUpdated] = useState("")

  const [savingMessage, setMessage] = useState("")

  const [detailToggle, setDetail] = useState(true)
  const [dialogueToggle, setDialogue] = useState(false)
  const [dialogErrorToggle, setDialogueError] = useState(false)
  const [tab, setTab] = React.useState('1');

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [stdout, setStdout] = useState("");

  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [id, setId] = useState(-1);

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
    out = res.data.stdout
    
    setStdout(out.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''))
    if (res.status === 201) {
      toast.error("Execution Successful but Timed Out")
    }
    setIsExecuting(false)
  }

  const triggerSave = async (event: React.FormEvent<HTMLFormElement> | undefined) =>   {
      var newTitle = title 
      var newDesc = desc
      if (event)  {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        if (!data.get("title") || !data.get("desc"))  {
          setDialogueError(true)
          return;
        }
        newTitle = data.get("title") as string
        newDesc = data.get("desc") as string
      }

      setDialogueError(false)
      setIsSaving(true);
      setMessage("Saving Changes...")

      const reqBody = { title: newTitle, explanation: newDesc, codeContent: code, language: language, tags: tempTags};
      const res = await API.code.editTemplate(id, reqBody,  _.get(auth, "accessToken", ""))
      if (res.status === 200) {
        toast.success("Changes Successfully Saved")
        fillDetails(res.data.result)
      } else  {
        toast.error(res.data.message)
      }
      if (dialogueToggle) {
        toggleDialogue()
      }

      setIsSaving(false);
  }

  const forkTemplate = async () =>  {
    setIsSaving(true);
    setMessage("Forking Template...")
    const res = await API.code.forkTemplate(id, _.get(auth, "accessToken", ""))
    if (res.status === 200) {
      toast.success("Fork Successful!")
      const encryptedId = window.btoa(res.data.template.id)
      router.push("/code-template?id=" + encryptedId)
    } else if (res.status === 201)  {
      toast.success("Fork Successful!")
      const encryptedId = window.btoa(res.data.template.id)
      router.push("/coding?id=" + encryptedId)
    } else  {
      toast.error(res.data.message)
    }
    setIsSaving(false);
  }

  const deleteTemplate = async () =>  {
    setIsSaving(true);
    setMessage("Deleting Template...")

    const res = await API.code.deleteTemplate(id, _.get(auth, "accessToken", ""))
    if (res.status === 200) {
      toast.success("Delete Successful!")
      router.push("/coding")
    } else  {
      toast.error(res.data.message)
    }
  }

  const toggleDetail = () =>    {
    setDetail(!detailToggle);
  }

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };

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

  const fillTemplate = async (id: number) =>    {
    const template = await API.code.getTemplate(id)
    if (template.status === 200)    {
      fillDetails(template.data.result)
    }   else    {
        router.push("/coding")
    }
  }

  const fillDetails = (data: {codeContent: string, title: string, explanation: string, tags: string[],
                              id: number, authorId: string, parentTemplateId: string, createdAt: string, updatedAt: string
  }) => {
    setCode(data.codeContent)
    setTitle(data.title)
    setDesc(data.explanation)

    const newTags: string[] = []

    data.tags.forEach((tag: any) => {
        newTags.push(tag.name)
    });

    setTags(newTags);

    setId(data.id);
    setIsOwner(auth.user?.id === data.authorId);
    setAuthor(("Author #" + data.authorId).slice(0, 12));
    setParentId((data.parentTemplateId === null) ? "" : window.btoa(data.parentTemplateId));
    const created_local = ((data.createdAt.split("T")[0] + " " + data.createdAt.split("T")[1].split(".")[0] + " UTC")).toString().split(" ")[0];
    setCreated(created_local);

    const updated_local = (new Date(data.updatedAt.split("T")[0] + " " + data.updatedAt.split("T")[1].split(".")[0] + " UTC")).toString().split(" ");
    const updated_date = updated_local.slice(1, 4).join(" ");
    const updated_time = updated_local[4];
    setUpdated(updated_date + " at " + updated_time);
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
  }, [router]);

  const forkAlert = () =>  {
    confirmAlert({
      message: "Would you like to create a fork of this template?",
      buttons: [
        {
          label: 'Yes',
          onClick: forkTemplate
        },
        {
          label: 'No'
        }
      ]
    })
  }

  const deleteAlert = () =>  {
    confirmAlert({
      message: "Would you like to delete this template?",
      buttons: [
        {
          label: 'Yes',
          onClick: deleteTemplate
        },
        {
          label: 'No'
        }
      ]
    })
  }

  const deleteTag = (tag: string)  =>  {
    var newTags = tempTags.filter((word) => (!(word === tag)));
    setTempTags(newTags);
  }

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
            <DialogTitle>
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
                  label="Enter a Tag"
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

      <Paper elevation={1} className="flex flex-col items-start p-4 px-10 w-full">
        <Box className="w-full">
          <Stack direction="column" alignItems="flex-start">
            <Typography variant="h4" className="w-full break-words">{title}</Typography>
            <Typography variant="subtitle1" className="w-full break-words px-1">{`By ${author} | Posted ${created}`}</Typography>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={toggleDetail}
                size="small" 
                className="text-sm px-3 py-1"
              >
                {(detailToggle) ? "Hide Details" : "Show Details"}
              </Button>

              {isOwner && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={toggleDialogue}
                  size="small"
                  className="text-sm px-3 py-1"
                >
                  Edit
                </Button>
              )}

              {isOwner && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={deleteAlert}
                  size="small" 
                  className="text-sm px-3 py-1"
                >
                  Delete
                </Button>
              )}
            </Stack>

          </Stack>

          {detailToggle && (
            <Stack spacing={1}>
              <Typography variant="body1" className="w-full break-words">{desc}</Typography>
              {parentId && (
                <Stack direction="row" spacing={1}>
                  <Typography variant="subtitle1" className="font-semibold">Parent Template:</Typography>
                  <Link href={"/code-template?id=" + parentId}>Link</Link>
                </Stack>
              )}

              <Stack direction="row" alignItems="center" spacing={1} className="mt-2">
                <Typography className="font-semibold" variant="subtitle1">Tags:</Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap", 
                    gap: 1,          
                  }}
                >
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      variant="outlined"
                      label={tag}
                    />
                  ))}
                </Box>
              </Stack>
            </Stack>
          )}
        </Box>
      </Paper>


      {isSaving && (
            <div className="flex justify-center items-center p-2 bg-blue-500 space-x-2">
              <h1 className="text-white">{savingMessage}</h1>
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            </div>
      )}

      <div className="flex flex-col sm:flex-row flex-grow overflow-hidden p-2 sm:p-4 space-y-2 sm:space-y-0 sm:space-x-4">

        <Paper 
          elevation={10}
          className="overflow-hidden w-full sm:w-4/5 h-full"
        >
          <Box sx={{ width: '100%', typography: 'body1', height: '100%' }}
              className="bg-gray-100 border-b border-gray-300 shadow">
            <TabContext value={tab}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleChange} aria-label="lab API tabs example">
                  <Tab label="Code Editor" value="1" />
                  <Tab label="stdin" value="2" />
                </TabList>
              </Box>

              <div className="flex flex-row items-center justify-between bg-gray-100 p-2 sm:p-3 border-b border-gray-300">
                <div className="flex items-center space-x-2">
                  <FormControl variant="filled" sx={{ minWidth: 120, maxHeight: 50}}>
                    <InputLabel id="demo-simple-select-filled-label">Language</InputLabel>
                      <Select
                      labelId="demo-simple-select-filled-label"
                      onChange={(e) => setLanguage(e.target.value as string)}
                      defaultValue={"python"}
                    >
                      {languages.map((language) => (
                        <MenuItem key={language} value={language}>
                          {language}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <Stack>
                  <div className="ml-auto flex space-x-2">
                    {isOwner && (
                      <Button
                          variant="contained"
                          onClick={() => {triggerSave(undefined)}}
                          className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm sm:text-base"
                        >
                          Save
                      </Button>
                    )}

                    <Button 
                      variant="contained"
                      color="secondary"
                      onClick={() => {forkAlert()}}
                    >
                      Fork
                    </Button>

                    <Button
                      variant="contained"
                      onClick={execute}
                      className="bg-green-500 text-white px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded hover:bg-green-600"
                    >
                      Execute
                    </Button>
                  </div>
                  <Box>
                    <Typography variant="caption">Last Updated: {updated}</Typography>
                  </Box>
                  
                </Stack>

              </div>

              <div className="flex-grow flex overflow-hidden h-full">
                <TabPanel value="1" className="w-full h-full p-0">
                  <div className="w-full h-full">
                    <Editor
                      value={code}
                      onChange={(value) => setCode(value || "")}
                      className="w-full h-full border-none focus:outline-none"
                      language={language}
                      theme="vs-dark"
                    />
                  </div>
                </TabPanel>
                <TabPanel value="2" className="w-full h-full p-0">
                  <div 
                    className="w-full h-full overflow-hidden" 
                    style={{ position: "relative" }}
                  >
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="w-full h-full resize-none bg-gray-800 text-gray-200 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        overflow: 'auto',
                        boxSizing: 'border-box',
                        padding: '8px',
                      }}
                    />
                  </div>
                </TabPanel>
              </div>
            </TabContext>
          </Box>
        </Paper>

        <Paper 
          elevation={10}
          className="overflow-hidden w-full sm:w-1/5 sm:h-auto sm:self-stretch"
        >
          <div className="bg-gray-100 p-2 sm:p-3 border-b border-gray-300">
            <Typography className="text-sm sm:text-lg font-semibold">stdout</Typography>
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
        </Paper>
      </div>
    </div>
    );
}
