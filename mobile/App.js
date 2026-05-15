import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, TextInput, TouchableOpacity, ScrollView,
  View, SafeAreaView, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from './src/services/api';

export default function App() {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initialState = {
    matricula: '',
    nome_guerra: '',
    nome_completo: '',
    turma: '1° ano',
    segmento: 'masculino',
    funcao: 'Não', // Atualizado para Sim/Não
    estado_saude: 'Apto', // Atualizado para Apto/Não Apto
    email_institucional: ''
  };

  const [form, setForm] = useState(initialState);

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      const response = await api.get('/alunos'); // Consome GET do backend
      setAlunos(response.data);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    }
  };

  const handleSave = async () => {
    if (!form.matricula || !form.nome_guerra || !form.email_institucional) {
      Alert.alert("Erro", "Preencha os campos obrigatórios (*)");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/alunos/${form.matricula}`, form); // Consome PUT
        Alert.alert("Sucesso", "Dados atualizados!");
      } else {
        await api.post('/alunos', form); // Consome POST
        Alert.alert("Sucesso", "Aluno cadastrado!");
      }
      cancelEdit();
      fetchAlunos();
    } catch (error) {
      Alert.alert("Erro", "Falha na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (matricula) => {
    Alert.alert("Excluir", "Deseja apagar este aluno?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar", style: "destructive", onPress: async () => {
          try {
            await api.delete(`/alunos/${matricula}`); // Consome DELETE[cite: 1]
            fetchAlunos();
          } catch (error) { Alert.alert("Erro", "Não foi possível excluir."); }
        }
      }
    ]);
  };

  const startEdit = (aluno) => {
    setForm(aluno);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm(initialState);
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a233b" />

      <View style={styles.header}>
        <View style={styles.headerIconBox}>
          <MaterialCommunityIcons name="shield-check-outline" size={28} color="#fff" />
        </View>
        <View>
          <Text style={styles.headerTitle}>SISTEMA DE ESCALA MILITAR</Text>
          <Text style={styles.headerSubtitle}>GESTÃO DE EFETIVO</Text>
        </View>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isEditing ? "Editar Aluno" : "Cadastro de Aluno"}</Text>
          <View style={styles.divider} />

          <Label title="Número de Matrícula *" />
          <TextInput style={[styles.input, isEditing && styles.inputDisabled]}
            value={form.matricula} editable={!isEditing}
            onChangeText={(v) => setForm({ ...form, matricula: v })} />

          <Label title="Nome de Guerra *" />
          <TextInput style={styles.input} value={form.nome_guerra}
            onChangeText={(v) => setForm({ ...form, nome_guerra: v })} />

          <Label title="Nome Completo *" />
          <TextInput style={styles.input} value={form.nome_completo}
            onChangeText={(v) => setForm({ ...form, nome_completo: v })} />

          <Label title="Turma *" />
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
              {['1° ano', '2° ano', '3° ano', '4° ano', '5° ano'].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setForm({ ...form, turma: t })}
                  style={[
                    styles.optBtn,
                    { minWidth: 80, marginRight: 8 },
                    form.turma === t && { borderColor: '#1a233b', backgroundColor: '#1a233b10' }
                  ]}
                >
                  <Text style={[
                    styles.optText,
                    { marginLeft: 0 },
                    form.turma === t && { color: '#1a233b', fontWeight: 'bold' }
                  ]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* SELEÇÃO: SEGMENTO */}
          <Label title="Segmento *" />
          <View style={styles.selectorRow}>
            <OptionBtn label="Masculino" icon="gender-male" color="#0d6efd" selected={form.segmento === 'masculino'}
              onPress={() => setForm({ ...form, segmento: 'masculino' })} />
            <OptionBtn label="Feminino" icon="gender-female" color="#d63384" selected={form.segmento === 'feminino'}
              onPress={() => setForm({ ...form, segmento: 'feminino' })} />
          </View>

          {/* SELEÇÃO: ESTADO DE SAÚDE (Novo pedido) */}
          <Label title="Estado de Saúde *" />
          <View style={styles.selectorRow}>
            <OptionBtn label="Apto" icon="check-circle-outline" color="#198754" selected={form.estado_saude === 'Apto'}
              onPress={() => setForm({ ...form, estado_saude: 'Apto' })} />
            <OptionBtn label="Não Apto" icon="close-circle-outline" color="#dc3545" selected={form.estado_saude === 'Não Apto'}
              onPress={() => setForm({ ...form, estado_saude: 'Não Apto' })} />
          </View>

          {/* SELEÇÃO: FUNÇÃO (Novo pedido) */}
          <Label title="Está em função de comando? *" />
          <View style={styles.selectorRow}>
            <OptionBtn label="Sim" icon="briefcase-check" color="#1a233b" selected={form.funcao === 'Sim'}
              onPress={() => setForm({ ...form, funcao: 'Sim' })} />
            <OptionBtn label="Não" icon="briefcase-off" color="#6c757d" selected={form.funcao === 'Não'}
              onPress={() => setForm({ ...form, funcao: 'Não' })} />
          </View>

          <Label title="E-mail Institucional *" />
          <TextInput style={styles.input} value={form.email_institucional}
            onChangeText={(v) => setForm({ ...form, email_institucional: v })} />

          <View style={styles.row}>
            {isEditing && (
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={cancelEdit}><Text style={styles.btnText}>Cancelar</Text></TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.btn, styles.btnSave, { flex: isEditing ? 2 : 1 }]} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{isEditing ? "Salvar" : "Cadastrar"}</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Alunos Cadastrados ({alunos.length})</Text>
          {alunos.map((item) => (
            <View key={item.matricula} style={styles.alunoCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardMatricula}>MAT: {item.matricula}</Text>
                  <Text style={styles.cardNome}>{item.nome_guerra}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => startEdit(item)}><MaterialCommunityIcons name="pencil" size={22} color="#0d6efd" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.matricula)}><MaterialCommunityIcons name="trash-can" size={22} color="#dc3545" style={{ marginLeft: 15 }} /></TouchableOpacity>
                </View>
              </View>
              <Text style={styles.cardSubInfo}>{item.nome_completo} • {item.turma}</Text>
              <View style={styles.pillRow}>
                <Pill label={item.segmento} color={item.segmento === 'feminino' ? '#d63384' : '#0d6efd'} />
                <Pill label={`Saúde: ${item.estado_saude}`} color="#198754" />
                <Pill label={`Função: ${item.funcao}`} color="#444" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-componentes para limpeza do código
const Label = ({ title }) => <Text style={styles.label}>{title}</Text>;
const Pill = ({ label, color }) => (
  <View style={[styles.pill, { borderColor: color }]}><Text style={{ color: color, fontSize: 10, fontWeight: 'bold' }}>{label.toUpperCase()}</Text></View>
);
const OptionBtn = ({ label, icon, color, selected, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.optBtn, selected && { borderColor: color, backgroundColor: color + '10' }]}>
    <MaterialCommunityIcons name={icon} size={18} color={selected ? color : '#999'} />
    <Text style={[styles.optText, selected && { color: color, fontWeight: 'bold' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { backgroundColor: '#1a233b', padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 4, borderBottomColor: '#ccc' },
  headerIconBox: { backgroundColor: '#2c3e50', padding: 6, borderRadius: 8, marginRight: 12 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerSubtitle: { color: '#bdc3c7', fontSize: 11 },
  container: { flex: 1, padding: 15 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, elevation: 4, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  label: { fontSize: 12, fontWeight: '700', color: '#666', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, fontSize: 15, backgroundColor: '#fdfdfd' },
  inputDisabled: { backgroundColor: '#eee', color: '#999' },
  selectorRow: { flexDirection: 'row', gap: 10, marginVertical: 5 },
  optBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 6 },
  optText: { marginLeft: 8, fontSize: 13, color: '#888' },
  row: { flexDirection: 'row', gap: 10 },
  btn: { padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 20 },
  btnSave: { backgroundColor: '#1a233b' },
  btnCancel: { backgroundColor: '#6c757d' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  listSection: { marginBottom: 50 },
  listTitle: { fontSize: 17, fontWeight: 'bold', color: '#1a233b', marginBottom: 15 },
  alunoCard: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f9f9f9', paddingBottom: 8 },
  cardMatricula: { fontSize: 10, color: '#aaa' },
  cardNome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardSubInfo: { fontSize: 12, color: '#777', marginTop: 5 },
  pillRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  pill: { borderWidth: 1, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10 },
  actionRow: { flexDirection: 'row', alignItems: 'center' }
});