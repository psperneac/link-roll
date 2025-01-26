import { useAuthSession } from '@/providers/AuthProvider';
import Uuid from 'expo-modules-core/src/uuid';
import { ReactNode, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, SafeAreaView, Text, TextInput, View, StyleSheet } from 'react-native';
import { doLogin, useAppDispatch, useAppSelector } from '../../store';

export default function Login(): ReactNode {
  const {signIn} = useAuthSession();
  const dispatch = useAppDispatch();

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const [ submittedData, setSubmittedData ] = useState({
    email: '',
    password: ''
  });

  const onSubmit = (data) => {
    // Simulate form submission
    console.log('Submitted Data:', data);
    setSubmittedData(data);
    dispatch(doLogin({ email: data.email, password: data.password }));
    const random: string = Uuid.v4();
    signIn(random);
  };

  return (
    <SafeAreaView>

      <View style={styles.container}>

        <Controller
          control={control}
          defaultValue = {''}
          render={({ field }) => (
            <TextInput
              {...field}
              style={styles.input}
              placeholder="Email"
            />
          )}
          name="email"
          rules={{ required: 'You must enter your email', pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email address' } }}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

        <Controller
          control={control}
          defaultValue = {''}
          render={({ field }) => (
            <TextInput
              {...field}
              style={styles.input}
              placeholder="Password"
              secureTextEntry={true}
            />
          )}
          name="password"
          rules={{ required: 'You must enter your password' }}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

        {/* Submit Butonu */}
        <Button title="Login" onPress={handleSubmit(onSubmit)} />

        {/* Gönderilen Veriler */}
        {submittedData && (
          <View style={styles.submittedContainer}>
            <Text style={styles.submittedTitle}>Submitted Data:</Text>
            <Text>Email: {submittedData.email}</Text>
            <Text>Password: {submittedData.password ? '***' : '#none'}</Text>
          </View>
        )}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 5*16,
    paddingLeft: 16,
    paddingRight: 16,
    maxWidth: 30*16,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  submittedContainer: {

  },
  submittedTitle: {

  }
});